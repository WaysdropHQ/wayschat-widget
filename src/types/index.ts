// ─── Connection ───────────────────────────────────────────────────────────────

export type UserRole = 'VISITOR' | 'USER' | 'ADMIN'

export type ConnectedPayload =
  | { message: string; role: 'VISITOR'; visitorId: string }
  | { message: string; role: 'USER'; userId: string; profiles: Array<{ id: string; type: string }> }
  | { message: string; role: 'ADMIN'; memberId: string }

// ─── Messages ─────────────────────────────────────────────────────────────────

export type MessageDirection = 'INBOUND' | 'OUTBOUND'

export type SenderRole = 'VISITOR' | 'USER' | 'MEMBER' | 'BOT'

export type ChatMessage = {
  id: string
  content?: string | null
  file?: string | null
  externalId?: string | null
  direction: MessageDirection
  senderRole: SenderRole
  type: string
  createdAt: string
  /**
   * Validated rich attachments (WaysAI bot messages only). Built from the wire
   * payload by `parseAttachments`; null/absent on every other message and on
   * servers that predate attachments.
   */
  attachments?: ChatAttachment[] | null
}

/**
 * A message exactly as the server sends it. `attachments` is untrusted until it
 * has been through `parseAttachments` (see `toChatMessage`).
 */
export type ChatMessageWire = Omit<ChatMessage, 'attachments'> & {
  attachments?: unknown
}

// ─── Attachments (B114 contract, support-chat customer view) ─────────────────

/** Integer minor units as a decimal string, e.g. { amountMinor: '250000', currency: 'NGN' }. */
/** `scale`: decimal places of `amountMinor` per the server's table; null on payloads without it. */
export type Money = { amountMinor: string; currency: string; scale: number | null }

/**
 * The subset of the server's `ProductCard` the widget renders. Every field
 * keeps its contract name; URLs have already been restricted to https.
 */
export type ChatProductCard = {
  id: string
  name: string
  /** Contract `imageUrl`, falling back to `image`; https only, else null. */
  imageUrl: string | null
  price: Money
  /** Non-null: show `dealPrice` large and `price` struck through. */
  deal: { discountPct: number; dealPrice: Money } | null
  inStock: boolean
  store: { name: string } | null
  /** Public product page; https only. Null: the card is not a link. */
  url: string | null
}

export type ChatProductsAttachment = {
  type: 'PRODUCTS'
  /** ISO-8601 UTC instant the prices and stock were read at. */
  pricedAt: string | null
  /** 1..10, in display order. */
  items: ChatProductCard[]
}

/** Only PRODUCTS is understood today; unknown attachment types are dropped by the parser. */
export type ChatAttachment = ChatProductsAttachment

// ─── Chat Status ──────────────────────────────────────────────────────────────

export type ChatStatus = 'OPEN' | 'RESOLVED' | 'CLOSED' | 'PENDING'

export type SupportChatUpdatedAction =
  | 'ASSIGNED'
  | 'OPENED'
  | 'RESOLVED'
  | 'AI_ASSIGNED'
  | 'AI_RESOLVED'

// ─── Socket Payloads (Server → Client) ────────────────────────────────────────

export type SupportMessageSentPayload = {
  chatId: string
  message: ChatMessageWire
}

export type SupportNewMessagePayload = {
  chatId: string
  message: ChatMessageWire
}

export type SupportChatUpdatedPayload = {
  action: SupportChatUpdatedAction
  chat: {
    id: string
    status: string
    channel: string
    assigneeId?: string | null
  }
}

export type SupportTypingActor = 'USER' | 'ADMIN' | 'WAYSAI'

export type SupportTypingServerPayload = {
  chatId: string
  isTyping: boolean
  actor: SupportTypingActor
}

export type SocketError = {
  code: number
  message: string
}

// ─── Socket Payloads (Client → Server) ────────────────────────────────────────

export type SupportSendMessageDTO = {
  content?: string
  file?: string
  name?: string
  email?: string
  phone?: string
  externalId?: string
}

// ─── Visitor Identity Form ────────────────────────────────────────────────────

export type VisitorInfo = {
  email: string        // compulsory
  name?: string
  phone?: string
}

// ─── Chat Config (passed by consuming app) ────────────────────────────────────

export type ChatConfig = {
  serverUrl: string
  apiUrl: string
  token?: string
  visitorId?: string
  theme?: 'light' | 'dark' | 'system'
  primaryColor?: string
  /** Custom logo URL. If omitted, the default Waysdrop logo is used. */
  logo?: string
  /** Replace the hero title on the home screen. Defaults to "Hi there! 👋" */
  title?: string
  /** Replace the hero subtitle on the home screen. */
  subtitle?: string
  /** Accepted file MIME types for attachment. Defaults to all: image/*, video/*, audio/*, application/pdf etc. */
  acceptedFileTypes?: string
}

// ─── Store State ──────────────────────────────────────────────────────────────

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error'

export type ChatState = {
  status: ConnectionStatus
  role: UserRole | null
  visitorId: string | null
  chatId: string | null
  /** Status of the active chat as reported by support-chat-updated events */
  chatStatus: ChatStatus | null
  messages: ChatMessage[]
  error: SocketError | null
  visitorInfo: VisitorInfo | null
  /** Who (if anyone) is currently typing on the agent side. Null when no typing. */
  typingActor: Exclude<SupportTypingActor, 'USER'> | null
}