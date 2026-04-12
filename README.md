# @waysdrop/chat

A floating support chat widget for React apps, backed by Socket.IO.

---

## Installation

```bash
npm install @waysdrop/chat
```

**Peer dependencies** — install these if not already in your project:

```bash
npm install react react-dom
```

---

## Usage

```tsx
import { ChatWidget } from '@waysdrop/chat'

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
  serverUrl: string       // Socket.IO server URL
  apiUrl: string          // REST base URL (used for file uploads)
  token?: string          // JWT for authenticated users — omit for visitor flow
  visitorId?: string      // Pass a returning visitor's ID to restore chat history
  theme?: 'light' | 'dark' | 'system'  // defaults to 'system'
  primaryColor?: string   // any valid CSS color — defaults to Waysdrop blue
}
```

**Visitor flow** — when `token` is omitted, the widget assigns the user a `visitorId` on first connect and persists it to `localStorage` automatically. On subsequent loads, it reads it back. You can also manage this yourself:

```ts
import { loadVisitorId, saveVisitorId, clearVisitorId } from '@waysdrop/chat'

loadVisitorId()        // reads from localStorage
saveVisitorId(id)      // writes to localStorage
clearVisitorId()       // clears — use on logout
```

**Authenticated flow** — pass a `token` (JWT). The socket server resolves the user from it. No `visitorId` needed. If the token changes at runtime (user logs in after mount), the widget automatically destroys the old socket connection and reconnects with the new token.

**Theming** — `theme` controls the color scheme. `system` follows the OS `prefers-color-scheme`. `light` and `dark` force it regardless of the OS setting. `primaryColor` accepts any valid CSS color value:

```tsx
<ChatWidget
  config={{
    serverUrl: '...',
    apiUrl: '...',
    theme: 'dark',
    primaryColor: '#7c3aed',
  }}
/>
```

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
  sendFile,     // (file: File, content?: string, info?: VisitorInfo) => Promise<void>
} = useChat(config)
```

`sendMessage` and `sendFile` accept an optional `VisitorInfo` argument for the first message in a visitor session. `sendFile` also accepts an optional `content` string to send text alongside the file in a single message.

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
  email: string
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

After changes, bump the version and publish:

```bash
npm version patch   # bug fix
npm version minor   # new feature
npm version major   # breaking change

npm publish --access public
git push origin main --tags
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