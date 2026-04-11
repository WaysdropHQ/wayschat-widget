import { create } from 'zustand'
import type {
  ChatState,
  ChatMessage,
  UserRole,
  SocketError,
  VisitorInfo,
  ConnectionStatus,
} from '../types'

type ChatActions = {
  setStatus: (status: ConnectionStatus) => void
  setRole: (role: UserRole) => void
  setVisitorId: (id: string) => void
  setChatId: (id: string) => void
  addMessage: (message: ChatMessage) => void
  setError: (error: SocketError | null) => void
  setVisitorInfo: (info: VisitorInfo) => void
  reset: () => void
}

const initialState: ChatState = {
  status: 'idle',
  role: null,
  visitorId: null,
  chatId: null,
  messages: [],
  error: null,
  visitorInfo: null,
}

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setRole: (role) => set({ role }),
  setVisitorId: (id) => set({ visitorId: id }),
  setChatId: (id) => set({ chatId: id }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setError: (error) => set({ error }),
  setVisitorInfo: (info) => set({ visitorInfo: info }),
  reset: () => set(initialState),
}))