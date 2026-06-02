import { useEffect, useCallback } from 'react'
import { createSocket, getSocket, getCurrentSocket, destroySocket } from '../lib/socket'
import { saveVisitorId, uploadFile } from '../lib/upload'
import { useChatStore } from '../store/chatStore'
import type {
  ChatConfig,
  ConnectedPayload,
  SupportMessageSentPayload,
  SupportNewMessagePayload,
  SupportChatUpdatedPayload,
  SupportTypingServerPayload,
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
    typingActor,
    setStatus,
    setRole,
    setVisitorId,
    setChatId,
    setChatStatus,
    addMessage,
    setError,
    setVisitorInfo,
    setTypingActor,
    reset,
    resetChat,
  } = useChatStore()

  useEffect(() => {
    const socket = createSocket(config)

    setStatus('connecting')
    socket.connect()

    socket.on('connect', () => {
      setStatus('connected')
      setError(null)
    })

    socket.on('connected', (payload: ConnectedPayload) => {
      setStatus('connected')
      setError(null)
      setRole(payload.role)

      if (payload.role === 'VISITOR') {
        saveVisitorId(payload.visitorId)
        setVisitorId(payload.visitorId)
      }
    })

    socket.on('support-message-sent', (payload: SupportMessageSentPayload) => {
      setChatId(payload.chatId)
      setChatStatus(null)
      addMessage(payload.message)
    })

    socket.on('support-new-message', (payload: SupportNewMessagePayload) => {
      setChatId(payload.chatId)
      setChatStatus(null)
      setTypingActor(null)
      addMessage(payload.message)
    })

    socket.on('support-typing', (payload: SupportTypingServerPayload) => {
      // Ignore the visitor/user's own typing echo — we only render the other party.
      if (payload.actor === 'USER') return
      setTypingActor(payload.isTyping ? payload.actor : null)
    })

    socket.on('support-chat-updated', (payload: SupportChatUpdatedPayload) => {
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
      setTypingActor(null)
      if (reason !== 'io client disconnect') {
        setStatus('connecting')
      }
    })

    socket.io.on('reconnect_attempt', () => {
      setStatus('connecting')
    })

    socket.io.on('reconnect', () => {
      setStatus('connected')
      setError(null)
    })

    socket.io.on('reconnect_error', () => {
      setStatus('connecting')
    })

    return () => {
      destroySocket()
      reset()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.serverUrl, config.token])

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

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      const currentChatId = useChatStore.getState().chatId
      if (!currentChatId) return
      const socket = getCurrentSocket()
      if (!socket?.connected) return
      socket.emit('support-typing', { chatId: currentChatId, isTyping })
    },
    []
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
    typingActor,
    setVisitorInfo,
    sendMessage,
    sendFile,
    sendTyping,
    resetChat,
  }
}
