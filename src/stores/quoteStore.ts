import { create } from 'zustand'
import { api } from '../lib/api'
import type { Quote } from '../types'

interface QuoteStore {
  quotes: Quote[]
  currentQuote: Quote | null
  loading: boolean
  setCurrentQuote: (quote: Quote | null) => void
  fetchQuotes: () => Promise<void>
  saveQuote: (quote: Quote) => Promise<void>
  deleteQuote: (id: string) => Promise<void>
  updateStatus: (id: string, status: Quote['status']) => Promise<void>
}

export const createEmptyQuote = (templateId: string): Quote => ({
  id: crypto.randomUUID(),
  clientName: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
  status: 'draft',
  items: [{ id: crypto.randomUUID(), name: '', quantity: 1, unitPrice: 0, estimateHours: 1, itemStatus: 'Aguard. Aprovação' }],
  discount: 0,
  discountType: 'percent',
  templateId,
  createdAt: new Date().toISOString(),
  scope: '',
  conditions: '',
  hourlyRate: 0,
  companyName: '',
  companyLogo: '',
})

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  quotes: [],
  currentQuote: null,
  loading: false,

  setCurrentQuote: (quote) => set({ currentQuote: quote }),

  fetchQuotes: async () => {
    set({ loading: true })
    try {
      const quotes = await api.listQuotes()
      set({ quotes })
    } finally {
      set({ loading: false })
    }
  },

  saveQuote: async (quote) => {
    const exists = get().quotes.find((q) => q.id === quote.id)
    const saved = exists
      ? await api.updateQuote(quote.id, quote)
      : await api.createQuote(quote)
    set((state) => ({
      quotes: exists
        ? state.quotes.map((q) => (q.id === saved.id ? saved : q))
        : [...state.quotes, saved],
      currentQuote: saved,
    }))
  },

  deleteQuote: async (id) => {
    await api.deleteQuote(id)
    set((state) => ({ quotes: state.quotes.filter((q) => q.id !== id) }))
  },

  updateStatus: async (id, status) => {
    const quote = get().quotes.find((q) => q.id === id)
    if (!quote) return
    const updated = await api.updateQuote(id, { ...quote, status })
    set((state) => ({
      quotes: state.quotes.map((q) => (q.id === id ? updated : q)),
    }))
  },
}))
