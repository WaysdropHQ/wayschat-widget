import { io, Socket } from 'socket.io-client'
import type { ChatConfig } from '../types'

let socket: Socket | null = null

export const createSocket = (config: ChatConfig): Socket => {
  if (socket) {
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
  })

  return socket
}

export const getSocket = (config: ChatConfig): Socket => {
  if (socket) return socket
  return createSocket(config)
}

export const destroySocket = (): void => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}