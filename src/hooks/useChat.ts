import { useEffect, useCallback } from 'react'
import { getSocket, destroySocket } from '../lib/socket'
import { saveVisitorId, uploadFile } from '../lib/upload'
import { useChatStore } from '../store/chatStore'
import type {
  ChatConfig,
  ConnectedPayload,
  SupportMessageSentPayload,
  SupportNewMessagePayload,
  SocketError,
  SupportSendMessageDTO,
  VisitorInfo,
} from '../types'

export const useChat = (config: ChatConfig) => {
  const {
    status,
    role,
    visitorId,
    chatId,
    messages,
    error,
    visitorInfo,
    setStatus,
    setRole,
    setVisitorId,
    setChatId,
    addMessage,
    setError,
    setVisitorInfo,
    reset,
  } = useChatStore()


  useEffect(() => {
    const socket = getSocket(config)

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
      addMessage(payload.message)
    })

    socket.on('support-new-message', (payload: SupportNewMessagePayload) => {
      setChatId(payload.chatId)
      addMessage(payload.message)
    })

    socket.on('error', (err: SocketError) => {
      setError(err)
      setStatus('error')
    })

    return () => {
      destroySocket()
      reset()
    }
  }, [])


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
    messages,
    error,
    visitorInfo,
    setVisitorInfo,
    sendMessage,
    sendFile,
  }
}