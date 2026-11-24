import type { Money } from '../types'

/**
 * Formats integer minor units for display. The decimal point is placed by
 * string manipulation using the currency's own fraction digits (from
 * `Intl.NumberFormat#resolvedOptions`), so no float arithmetic touches the
 * amount; the only conversion to a number is the final hand-off to `format`,
 * which is exact for the <= 15-digit amounts the parser admits.
 */

const formatters = new Map<string, Intl.NumberFormat | null>()

const currencyFormatter = (currency: string): Intl.NumberFormat | null => {
  const cached = formatters.get(currency)
  if (cached !== undefined) return cached
  let formatter: Intl.NumberFormat | null
  try {
    formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency })
  } catch {
    // Unknown ISO code in this runtime: RangeError. Cache the miss too.
    formatter = null
  }
  formatters.set(currency, formatter)
  return formatter
}

/** '250000', 2 -> '2500.00'; '5', 2 -> '0.05'; '1500', 0 -> '1500'. Input must be /^\d+$/. */
export const minorToDecimalString = (amountMinor: string, fractionDigits: number): string => {
  const digits = amountMinor.replace(/^0+(?=\d)/, '')
  if (fractionDigits <= 0) return digits
  const padded = digits.padStart(fractionDigits + 1, '0')
  const cut = padded.length - fractionDigits
  return `${padded.slice(0, cut)}.${padded.slice(cut)}`
}

/**
 * The decimal point goes where the server's `scale` says (its table can
 * differ from this runtime's Intl data); Intl's digits only for payloads
 * without a scale. Display keeps at least the currency's usual digits.
 */
export const formatMoney = (money: Money): string => {
  const formatter = currencyFormatter(money.currency)
  const intlDigits = formatter?.resolvedOptions().maximumFractionDigits ?? 2
  const scale = money.scale ?? intlDigits
  const decimal = minorToDecimalString(money.amountMinor, scale)
  if (!formatter) return `${money.currency} ${decimal}`
  if (scale === intlDigits) return formatter.format(Number(decimal))
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: scale,
    maximumFractionDigits: scale,
  }).format(Number(decimal))
}
