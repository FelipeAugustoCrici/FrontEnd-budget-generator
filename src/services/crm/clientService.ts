import { api } from '../../lib/api'
import type { CrmClient } from '../../lib/api'

export type { CrmClient }

export const clientService = {
  list: (params?: { search?: string; page?: number; limit?: number }) =>
    api.listClients(params).then((r) => r.data),

  listPaginated: (params?: { search?: string; page?: number; limit?: number }) =>
    api.listClients(params),

  get: (id: string) => api.getClient(id),

  create: (data: Omit<CrmClient, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
    api.createClient(data),

  update: (id: string, data: Partial<CrmClient>) =>
    api.updateClient(id, data),

  delete: (id: string) => api.deleteClient(id),
}
