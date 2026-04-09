import type { Quote, Template } from '../types'
import type { CompanySettings } from '../stores/settingsStore'

const AUTH_URL = import.meta.env.VITE_AUTH_URL ?? 'http://localhost:9001'
const CORE_URL = import.meta.env.VITE_CORE_URL ?? 'http://localhost:9000'

function getToken(): string | null {
  return localStorage.getItem('budget-token')
}

async function request<T>(baseUrl: string, path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('budget-token')
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
      window.location.href = '/login'
    }
    throw new Error('unauthorized')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'request failed')
  return data as T
}

interface AuthResponse {
  token: string
  user: { id: string; name: string; email: string }
}

const auth = <T>(path: string, options?: RequestInit) => request<T>(AUTH_URL, path, options)
const core = <T>(path: string, options?: RequestInit) => request<T>(CORE_URL, path, options)

export const api = {
  // Auth
  register: (name: string, email: string, password: string) =>
    auth<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  login: (email: string, password: string) =>
    auth<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () =>
    core<{ id: string; name: string; email: string }>('/api/me'),

  // Quotes
  listQuotes: () => core<Quote[]>('/api/quotes'),
  getQuote: (id: string) => core<Quote>(`/api/quotes/${id}`),
  createQuote: (data: Quote) => core<Quote>('/api/quotes', { method: 'POST', body: JSON.stringify(data) }),
  updateQuote: (id: string, data: Quote) => core<Quote>(`/api/quotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuote: (id: string) => core<{ ok: boolean }>(`/api/quotes/${id}`, { method: 'DELETE' }),

  // Templates
  listTemplates: () => core<Template[]>('/api/templates'),
  getTemplate: (id: string) => core<Template>(`/api/templates/${id}`),
  createTemplate: (data: Template) => core<Template>('/api/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id: string, data: Template) => core<Template>(`/api/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTemplate: (id: string) => core<{ ok: boolean }>(`/api/templates/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => core<CompanySettings & { id?: string; userId?: string }>('/api/settings'),
  upsertSettings: (data: CompanySettings) => core<CompanySettings>('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // AI
  generateQuote: (prompt: string) =>
    core<Partial<Quote>>('/api/ai/quote', { method: 'POST', body: JSON.stringify({ prompt }) }),

  // Upload
  uploadFile: async (file: File): Promise<string> => {
    const token = localStorage.getItem('budget-token')
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${CORE_URL}/api/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'upload failed')
    return data.url as string
  },
}
