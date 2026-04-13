import { io, Socket } from 'socket.io-client'
import type { ChatConfig } from '../types'

let socket: Socket | null = null

export const createSocket = (config: ChatConfig): Socket => {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }

  const { serverUrl, token, visitorId } = config

  socket = io(serverUrl, {
    transports: ['websocket', 'polling'],
    auth: {
      ...(token ? { token } : {}),
      ...(visitorId ? { visitorId } : {}),
    },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
    timeout: 20000,
  })

  return socket
}

export const getSocket = (config: ChatConfig): Socket => {
  if (socket?.connected) return socket
  if (socket) {
    socket.connect()
    return socket
  }
  return createSocket(config)
}

export const destroySocket = (): void => {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}