import type { Quote, Template } from '../types'
import type { CompanySettings } from '../stores/settingsStore'

export interface QuoteVersion {
  id: string
  quoteId: string
  userId: string
  versionNumber: number
  isActive: boolean
  changeNote: string
  snapshot: Omit<Quote, 'id' | 'createdAt'>
  createdAt: string
}

export interface CrmClient {
  id: string
  user_id: string
  name: string
  company: string
  email: string
  phone: string
  notes: string
  created_at: string
  updated_at: string
}

export interface CrmContractEvent {
  id: string
  contract_id: string
  type: string
  metadata: string
  created_at: string
}

export interface CrmContract {
  id: string
  user_id: string
  client_id: string
  client?: CrmClient
  budget_id?: string
  value: number
  status: string
  start_date?: string
  end_date?: string
  auto_renew: boolean
  description: string
  sent_at?: string
  viewed_at?: string
  signed_at?: string
  created_at: string
  updated_at: string
}

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

  // CRM - Clients
  listClients: (params?: { search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    return core<{ data: CrmClient[]; total: number; page: number; limit: number }>(`/api/clients?${q}`)
  },
  getClient: (id: string) => core<CrmClient>(`/api/clients/${id}`),
  createClient: (data: Omit<CrmClient, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
    core<CrmClient>('/api/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id: string, data: Partial<CrmClient>) =>
    core<CrmClient>(`/api/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id: string) => core<{ ok: boolean }>(`/api/clients/${id}`, { method: 'DELETE' }),

  // CRM - Contracts
  listContracts: (params?: { client_id?: string; status?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.client_id) q.set('client_id', params.client_id)
    if (params?.status) q.set('status', params.status)
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    return core<{ data: CrmContract[]; total: number; page: number; limit: number }>(`/api/contracts?${q}`)
  },
  getContract: (id: string) => core<CrmContract>(`/api/contracts/${id}`),
  createContract: (data: Omit<CrmContract, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'client'>) =>
    core<CrmContract>('/api/contracts', { method: 'POST', body: JSON.stringify(data) }),
  updateContract: (id: string, data: Partial<CrmContract>) =>
    core<CrmContract>(`/api/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  sendContract: (id: string) => core<CrmContract>(`/api/contracts/${id}/send`, { method: 'POST' }),
  viewContract: (id: string) => core<CrmContract>(`/api/contracts/${id}/view`, { method: 'POST' }),
  signContract: (id: string) => core<CrmContract>(`/api/contracts/${id}/sign`, { method: 'POST' }),
  refuseContract: (id: string) => core<CrmContract>(`/api/contracts/${id}/refuse`, { method: 'POST' }),
  listContractEvents: (id: string) => core<CrmContractEvent[]>(`/api/contracts/${id}/events`),
  getContractByBudget: (budgetId: string) => core<CrmContract>(`/api/contracts/by-budget/${budgetId}`),

  // Quote versions
  listQuoteVersions: (id: string) => core<QuoteVersion[]>(`/api/quotes/${id}/versions`),
  activateQuoteVersion: (id: string, versionId: string) =>
    core<Quote>(`/api/quotes/${id}/versions/${versionId}/activate`, { method: 'POST' }),

  // Upload
  presignUpload: (filename: string, contentType: string) =>
    core<{ uploadUrl: string; publicUrl: string; objectKey: string }>('/api/upload/presign', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType }),
    }),

  uploadFile: async (file: File): Promise<string> => {
    const token = localStorage.getItem('budget-token')
    const CORE_URL_LOCAL = import.meta.env.VITE_CORE_URL ?? 'http://localhost:9000'

    // Get presigned URL from backend
    const { uploadUrl, publicUrl } = await (async () => {
      const res = await fetch(`${CORE_URL_LOCAL}/api/upload/presign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'presign failed')
      return data as { uploadUrl: string; publicUrl: string; objectKey: string }
    })()

    // Upload directly to R2/MinIO — no backend bandwidth used
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    if (!uploadRes.ok) throw new Error('upload to storage failed')

    return publicUrl
  },
}
