import { create } from 'zustand'
import { api } from '../lib/api'

export interface CompanySettings {
  name: string
  logo: string
  instagram: string
  facebook: string
  website: string
  email: string
  phone: string
  fontFamily: string
  fontUrl: string
  showNameOnHeader: boolean
}

const empty: CompanySettings = {
  name: '', logo: '', instagram: '', facebook: '',
  website: '', email: '', phone: '', fontFamily: '', fontUrl: '',
  showNameOnHeader: true,
}

interface SettingsStore {
  company: CompanySettings
  loading: boolean
  fetchSettings: () => Promise<void>
  update: (data: Partial<CompanySettings>) => void
  save: () => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  company: empty,
  loading: false,

  fetchSettings: async () => {
    set({ loading: true })
    try {
      const s = await api.getSettings()
      set({
        company: {
          name: s.name ?? '',
          logo: s.logo ?? '',
          instagram: s.instagram ?? '',
          facebook: s.facebook ?? '',
          website: s.website ?? '',
          email: s.email ?? '',
          phone: s.phone ?? '',
              fontFamily: s.fontFamily ?? '',
          fontUrl: s.fontUrl ?? '',
          showNameOnHeader: s.showNameOnHeader ?? true,
        },
      })
    } catch {
      // keep empty if not found
    } finally {
      set({ loading: false })
    }
  },

  update: (data) =>
    set((state) => ({ company: { ...state.company, ...data } })),

  save: async () => {
    await api.upsertSettings(get().company)
  },
}))
