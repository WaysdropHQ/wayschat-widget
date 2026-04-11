# ways-chat

Internal chat widget package for Waysdrop. Provides a floating support chat UI backed by Socket.IO — drop it into any React app with a single component.

---

## Installation

This is a private GitHub package. Your machine needs access to the `WaysdropHQ` GitHub org.

```bash
npm install github:WaysdropHQ/ways-chat#v1.0.0
```

Pin to a specific tag always. Avoid `#main` in production.

**Peer dependencies** — install these if not already in your project:

```bash
npm install react react-dom
```

---

## Usage

```tsx
import { ChatWidget } from 'ways-chat'

export default function App() {
  return (
    <ChatWidget
      config={{
        serverUrl: 'https://socket.waysdrop.com',
        apiUrl: 'https://api.waysdrop.com',
      }}
    />
  )
}
```

Mount `<ChatWidget />` once at the root of your app. It renders a floating button and manages its own panel state internally.

---

## Config

```ts
type ChatConfig = {
  serverUrl: string   // Socket.IO server URL
  apiUrl: string      // REST base URL (used for file uploads)
  token?: string      // JWT for authenticated users — omit for visitor flow
  visitorId?: string  // Pass a returning visitor's ID to restore chat history
}
```

**Visitor flow** — when `token` is omitted, the widget assigns the user a `visitorId` on first connect and persists it to `localStorage` automatically. On subsequent loads, it reads it back. You can also manage this yourself:

```ts
import { loadVisitorId, saveVisitorId, clearVisitorId } from 'ways-chat'

loadVisitorId()        // reads from localStorage
saveVisitorId(id)      // writes to localStorage
clearVisitorId()       // clears — use on logout
```

**Authenticated flow** — pass a `token` (JWT). The socket server resolves the user from it. No `visitorId` needed.

---

## Hooks

### `useChat(config)`

The underlying hook `ChatWidget` uses internally. Expose it if you want to build a custom UI on top of the same socket logic.

```ts
const {
  status,       // 'idle' | 'connecting' | 'connected' | 'error'
  role,         // 'VISITOR' | 'USER' | 'ADMIN'
  messages,     // ChatMessage[]
  error,        // SocketError | null
  visitorId,    // string | null
  chatId,       // string | null
  visitorInfo,  // VisitorInfo | null
  setVisitorInfo,
  sendMessage,  // (content: string, info?: VisitorInfo) => void
  sendFile,     // (file: File, info?: VisitorInfo) => Promise<void>
} = useChat(config)
```

`sendMessage` and `sendFile` accept an optional `VisitorInfo` argument for the first message in a visitor session (name, email, phone). After the first message, `visitorInfo` is stored in the Zustand store and reused automatically.

---

## Types

```ts
type ChatMessage = {
  id: string
  content?: string | null
  file?: string | null
  externalId?: string | null
  direction: 'INBOUND' | 'OUTBOUND'
  senderRole: 'VISITOR' | 'USER' | 'MEMBER' | 'BOT'
  type: string
  createdAt: string
}

type VisitorInfo = {
  email: string   // required
  name?: string
  phone?: string
}

type SocketError = {
  code: number
  message: string
}
```

---

## Versioning

After changes, bump the version and push a new tag:

```bash
npm version patch   # bug fix
npm version minor   # new feature
npm version major   # breaking change

git push origin main --tags
```

Consuming projects update their reference:

```json
"ways-chat": "github:WaysdropHQ/ways-chat#v1.0.1"
```

---

## Socket Events

For reference — what the widget sends and listens to.

| Direction        | Event                   | Payload                     |
|------------------|-------------------------|-----------------------------|
| Client → Server  | `support-send-message`  | `SupportSendMessageDTO`     |
| Server → Client  | `connected`             | `ConnectedPayload`          |
| Server → Client  | `support-message-sent`  | `SupportMessageSentPayload` |
| Server → Client  | `support-new-message`   | `SupportNewMessagePayload`  |
| Server → Client  | `error`                 | `SocketError`               |