import type {
  ChatAttachment,
  ChatMessage,
  ChatMessageWire,
  ChatProductCard,
  Money,
} from '../types'

/**
 * Runtime guard for the B114 `attachments` field. The payload is server data,
 * but it is rendered as links and images, so every value is checked here and
 * nothing downstream has to trust it.
 *
 * Rules: only `type === 'PRODUCTS'` is kept, unknown types are ignored,
 * malformed items are dropped (not the whole attachment), only https URLs
 * survive, and the function never throws. O(n) in the number of items, with
 * the input bounded by MAX_SCANNED_* so a hostile payload cannot make it spin.
 */

/** Contract: 1..10 items per attachment. */
const MAX_ITEMS = 10
/** Upper bounds on how much of an oversized payload is even looked at. */
const MAX_SCANNED_ATTACHMENTS = 10
const MAX_SCANNED_ITEMS = 50
const MAX_URL_LENGTH = 2048
/** 15 digits keeps every amount exactly representable once converted for display (< 2^53). */
const MINOR_UNITS = /^\d{1,15}$/
const ISO_4217 = /^[A-Z]{3}$/

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const nonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/** Returns the normalised URL when it parses and uses https, otherwise null. */
export const safeHttpsUrl = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_URL_LENGTH) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

/**
 * A message file's link target, or null when it must not be linked: only
 * https, or the page's own origin (relative paths, plain http on localhost).
 * Blocks javascript:, data:, blob: and the like. An opaque page origin
 * ('null', sandboxed frames) never counts as same-origin.
 */
export const safeFileHref = (
  value: unknown,
  pageOrigin: string | null = typeof window === 'undefined' ? null : window.location.origin,
): string | null => {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_URL_LENGTH) return null
  const base = pageOrigin && pageOrigin !== 'null' ? pageOrigin : undefined
  try {
    const url = new URL(value, base)
    if (url.protocol === 'https:') return url.href
    const sameOrigin = base !== undefined && url.protocol === 'http:' && url.origin === base
    return sameOrigin ? url.href : null
  } catch {
    return null
  }
}

export const parseMoney = (value: unknown): Money | null => {
  if (!isRecord(value)) return null
  const { amountMinor, currency } = value
  if (typeof amountMinor !== 'string' || !MINOR_UNITS.test(amountMinor)) return null
  if (typeof currency !== 'string' || !ISO_4217.test(currency)) return null
  const { scale } = value
  const validScale = typeof scale === 'number' && Number.isInteger(scale) && scale >= 0 && scale <= 4
  return { amountMinor, currency, scale: validScale ? scale : null }
}

const parseDeal = (value: unknown): ChatProductCard['deal'] => {
  if (!isRecord(value)) return null
  const { discountPct } = value
  if (typeof discountPct !== 'number' || !Number.isInteger(discountPct)) return null
  if (discountPct < 1 || discountPct > 100) return null
  const dealPrice = parseMoney(value.dealPrice)
  return dealPrice ? { discountPct, dealPrice } : null
}

export const parseProductCard = (value: unknown): ChatProductCard | null => {
  if (!isRecord(value)) return null
  const id = nonEmptyString(value.id)
  const name = nonEmptyString(value.name)
  const price = parseMoney(value.price)
  if (!id || !name || !price) return null

  const storeName = isRecord(value.store) ? nonEmptyString(value.store.name) : null

  return {
    id,
    name,
    imageUrl: safeHttpsUrl(value.imageUrl) ?? safeHttpsUrl(value.image),
    price,
    // A malformed deal degrades to the plain price rather than dropping the card.
    deal: parseDeal(value.deal),
    // Contract: boolean. Anything else is treated as in stock (the server only sends sellable cards today).
    inStock: value.inStock !== false,
    store: storeName ? { name: storeName } : null,
    url: safeHttpsUrl(value.url),
  }
}

const parseProductsAttachment = (value: UnknownRecord): ChatAttachment | null => {
  if (!Array.isArray(value.items)) return null
  const items: ChatProductCard[] = []
  const scanned = Math.min(value.items.length, MAX_SCANNED_ITEMS)
  for (let i = 0; i < scanned && items.length < MAX_ITEMS; i++) {
    const card = parseProductCard(value.items[i])
    if (card) items.push(card)
  }
  if (items.length === 0) return null
  return {
    type: 'PRODUCTS',
    pricedAt: typeof value.pricedAt === 'string' ? value.pricedAt : null,
    items,
  }
}

export const parseAttachments = (raw: unknown): ChatAttachment[] | null => {
  if (!Array.isArray(raw)) return null
  try {
    const out: ChatAttachment[] = []
    const scanned = Math.min(raw.length, MAX_SCANNED_ATTACHMENTS)
    for (let i = 0; i < scanned; i++) {
      const entry = raw[i]
      if (!isRecord(entry) || entry.type !== 'PRODUCTS') continue
      const parsed = parseProductsAttachment(entry)
      if (parsed) out.push(parsed)
    }
    return out.length > 0 ? out : null
  } catch {
    // Exotic inputs (throwing getters, proxies) must never break the message stream.
    return null
  }
}

/** Wire message to store message: everything passes through except `attachments`, which is validated. */
export const toChatMessage = (wire: ChatMessageWire): ChatMessage => {
  const { attachments, ...rest } = wire
  return { ...rest, attachments: parseAttachments(attachments) }
}
