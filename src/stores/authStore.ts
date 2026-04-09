import { create } from 'zustand'
import { api } from '../lib/api'

export interface User {
  id: string
  name: string
  email: string
}

interface AuthStore {
  currentUser: User | null
  token: string | null
  initialized: boolean
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  init: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: null,
  token: localStorage.getItem('budget-token'),
  initialized: false,

  init: async () => {
    const token = localStorage.getItem('budget-token')
    if (!token) {
      set({ initialized: true })
      return
    }
    try {
      const user = await api.me()
      set({ currentUser: user, token, initialized: true })
    } catch {
      // token invalid or backend offline — clear token, don't redirect here
      localStorage.removeItem('budget-token')
      set({ currentUser: null, token: null, initialized: true })
    }
  },

  register: async (name, email, password) => {
    try {
      const res = await api.register(name, email, password)
      localStorage.setItem('budget-token', res.token)
      set({ currentUser: res.user, token: res.token })
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  },

  login: async (email, password) => {
    try {
      const res = await api.login(email, password)
      localStorage.setItem('budget-token', res.token)
      set({ currentUser: res.user, token: res.token })
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  },

  logout: () => {
    localStorage.removeItem('budget-token')
    set({ currentUser: null, token: null })
  },
}))
