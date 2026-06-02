import { io, Socket } from 'socket.io-client'
import type { ChatConfig } from '../types'

let socket: Socket | null = null

export const createSocket = (config: ChatConfig): Socket => {
  if (socket) {
    socket.removeAllListeners()
    socket.io.removeAllListeners()
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
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
    timeout: 10000,
  })

  return socket
}

export const getCurrentSocket = (): Socket | null => socket

export const getSocket = (config: ChatConfig): Socket => {
  if (socket?.connected) return socket
  if (socket) {
    if (!socket.active) {
      socket.connect()
    }
    return socket
  }
  return createSocket(config)
}

export const destroySocket = (): void => {
  if (socket) {
    socket.removeAllListeners()
    socket.io.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}
