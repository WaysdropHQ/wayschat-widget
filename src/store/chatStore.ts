import { create } from 'zustand'
import type {
  ChatState,
  ChatMessage,
  ChatStatus,
  UserRole,
  SocketError,
  VisitorInfo,
  ConnectionStatus,
} from '../types'

type TypingActor = ChatState['typingActor']

type ChatActions = {
  setStatus: (status: ConnectionStatus) => void
  setRole: (role: UserRole) => void
  setVisitorId: (id: string) => void
  setChatId: (id: string) => void
  setChatStatus: (status: ChatStatus | null) => void
  addMessage: (message: ChatMessage) => void
  setError: (error: SocketError | null) => void
  setVisitorInfo: (info: VisitorInfo) => void
  setTypingActor: (actor: TypingActor) => void
  resetChat: () => void
  reset: () => void
}

const initialState: ChatState = {
  status: 'idle',
  role: null,
  visitorId: null,
  chatId: null,
  chatStatus: null,
  messages: [],
  error: null,
  visitorInfo: null,
  typingActor: null,
}

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setRole: (role) => set({ role }),
  setVisitorId: (id) => set({ visitorId: id }),
  setChatId: (id) => set({ chatId: id }),
  setChatStatus: (chatStatus) => set({ chatStatus }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setError: (error) => set({ error }),
  setVisitorInfo: (info) => set({ visitorInfo: info }),
  setTypingActor: (actor) => set({ typingActor: actor }),

  resetChat: () =>
    set((state) => ({
      ...initialState,
      visitorId: state.visitorId,
      role: state.role,
      status: state.status,
    })),

  reset: () => set(initialState),
}))