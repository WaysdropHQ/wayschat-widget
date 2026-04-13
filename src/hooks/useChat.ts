import { useEffect, useCallback } from 'react'
import { createSocket, getSocket, destroySocket } from '../lib/socket'
import { saveVisitorId, uploadFile } from '../lib/upload'
import { useChatStore } from '../store/chatStore'
import type {
  ChatConfig,
  ConnectedPayload,
  SupportMessageSentPayload,
  SupportNewMessagePayload,
  SupportChatUpdatedPayload,
  SocketError,
  SupportSendMessageDTO,
  VisitorInfo,
  ChatStatus,
} from '../types'

const RESOLVED_ACTIONS = new Set(['RESOLVED', 'AI_RESOLVED'])

export const useChat = (config: ChatConfig) => {
  const {
    status,
    role,
    visitorId,
    chatId,
    chatStatus,
    messages,
    error,
    visitorInfo,
    setStatus,
    setRole,
    setVisitorId,
    setChatId,
    setChatStatus,
    addMessage,
    setError,
    setVisitorInfo,
    reset,
    resetChat,
  } = useChatStore()

  useEffect(() => {
    const socket = createSocket(config)

    setStatus('connecting')
    socket.connect()

    socket.on('connected', (payload: ConnectedPayload) => {
      setStatus('connected')
      setRole(payload.role)

      if (payload.role === 'VISITOR') {
        saveVisitorId(payload.visitorId)
        setVisitorId(payload.visitorId)
      }
    })

    socket.on('support-message-sent', (payload: SupportMessageSentPayload) => {
      setChatId(payload.chatId)
      // If we get a new message after a resolved state, the server opened a
      // new chat — clear the closed status.
      setChatStatus(null)
      addMessage(payload.message)
    })

    socket.on('support-new-message', (payload: SupportNewMessagePayload) => {
      setChatId(payload.chatId)
      setChatStatus(null)
      addMessage(payload.message)
    })

    socket.on('support-chat-updated', (payload: SupportChatUpdatedPayload) => {
      // Only care about events for the current chat
      if (chatId && payload.chat.id !== chatId) return

      if (RESOLVED_ACTIONS.has(payload.action)) {
        setChatStatus('RESOLVED')
      } else {
        setChatStatus(payload.chat.status as ChatStatus)
      }
    })

    socket.on('error', (err: SocketError) => {
      setError(err)
      setStatus('error')
    })

    socket.on('disconnect', (reason: string) => {
      // Transport closed by server — attempt reconnect handled by socket.io
      // but update status so UI shows reconnecting state
      if (reason !== 'io client disconnect') {
        setStatus('connecting')
      }
    })

    socket.on('reconnect', () => {
      setStatus('connected')
    })

    return () => {
      destroySocket()
      reset()
    }
  // Re-run only when the identity-related config changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.serverUrl, config.token])

  // Keep chatId in a ref-like way so the support-chat-updated handler above
  // can compare without stale closure. We re-register the event inside the
  // same effect so it picks up the current chatId from the store via the
  // socket.on callback — this is fine because socket.on callbacks read from
  // the store directly via useChatStore, not from the closed-over value.

  const sendMessage = useCallback(
    (content: string, info?: VisitorInfo) => {
      const socket = getSocket(config)

      const dto: SupportSendMessageDTO = {
        content,
        externalId: `msg-${Date.now()}`,
        ...(info ?? visitorInfo
          ? {
              email: (info ?? visitorInfo)!.email,
              name: (info ?? visitorInfo)?.name,
              phone: (info ?? visitorInfo)?.phone,
            }
          : {}),
      }

      socket.emit('support-send-message', dto)
    },
    [config, visitorInfo]
  )

  const sendFile = useCallback(
    async (file: File, content?: string, info?: VisitorInfo) => {
      const url = await uploadFile(file, config)

      const socket = getSocket(config)

      const dto: SupportSendMessageDTO = {
        file: url,
        ...(content ? { content } : {}),
        externalId: `file-${Date.now()}`,
        ...(info ?? visitorInfo
          ? {
              email: (info ?? visitorInfo)!.email,
              name: (info ?? visitorInfo)?.name,
              phone: (info ?? visitorInfo)?.phone,
            }
          : {}),
      }

      socket.emit('support-send-message', dto)
    },
    [config, visitorInfo]
  )

  return {
    status,
    role,
    visitorId,
    chatId,
    chatStatus,
    messages,
    error,
    visitorInfo,
    setVisitorInfo,
    sendMessage,
    sendFile,
    resetChat,
  }
}