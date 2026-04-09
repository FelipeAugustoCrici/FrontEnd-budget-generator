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
    // only redirect if not already on auth pages
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
      window.location.href = '/login'
    }
    throw new Error('unauthorized')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'request failed')
  return data as T
}

const auth = (path: string, options?: RequestInit) => request(AUTH_URL, path, options)
const core = (path: string, options?: RequestInit) => request(CORE_URL, path, options)

export const api = {
  // Auth service
  register: (name: string, email: string, password: string) =>
    auth('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  login: (email: string, password: string) =>
    auth('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Core service
  me: () => core('/api/me'),

  listQuotes: () => core('/api/quotes'),
  getQuote: (id: string) => core(`/api/quotes/${id}`),
  createQuote: (data: any) => core('/api/quotes', { method: 'POST', body: JSON.stringify(data) }),
  updateQuote: (id: string, data: any) => core(`/api/quotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuote: (id: string) => core(`/api/quotes/${id}`, { method: 'DELETE' }),

  listTemplates: () => core('/api/templates'),
  getTemplate: (id: string) => core(`/api/templates/${id}`),
  createTemplate: (data: any) => core('/api/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id: string, data: any) => core(`/api/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTemplate: (id: string) => core(`/api/templates/${id}`, { method: 'DELETE' }),

  getSettings: () => core('/api/settings'),
  upsertSettings: (data: any) => core('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),

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
