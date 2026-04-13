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
}

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
  message: ChatMessage
}

export type SupportNewMessagePayload = {
  chatId: string
  message: ChatMessage
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
  isThinking: boolean
}