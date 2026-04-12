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

// ─── Socket Payloads (Server → Client) ────────────────────────────────────────

export type SupportMessageSentPayload = {
  chatId: string
  message: ChatMessage
}

export type SupportNewMessagePayload = {
  chatId: string
  message: ChatMessage
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
}

// ─── Store State ──────────────────────────────────────────────────────────────

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error'

export type ChatState = {
  status: ConnectionStatus
  role: UserRole | null
  visitorId: string | null
  chatId: string | null
  messages: ChatMessage[]
  error: SocketError | null
  visitorInfo: VisitorInfo | null   // set before first message on visitor flow
}