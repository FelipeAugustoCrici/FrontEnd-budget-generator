import { api } from '../../lib/api'
import type { CrmContract, CrmContractEvent } from '../../lib/api'

export type { CrmContract, CrmContractEvent }

export const contractService = {
  list: (params?: { client_id?: string; status?: string; page?: number; limit?: number }) =>
    api.listContracts(params).then((r) => r.data),

  listPaginated: (params?: { client_id?: string; status?: string; page?: number; limit?: number }) =>
    api.listContracts(params),

  get: (id: string) => api.getContract(id),

  create: (data: Omit<CrmContract, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'client'>) =>
    api.createContract(data),

  update: (id: string, data: Partial<CrmContract>) =>
    api.updateContract(id, data),

  send: (id: string) => api.sendContract(id),
  view: (id: string) => api.viewContract(id),
  sign: (id: string) => api.signContract(id),
  refuse: (id: string) => api.refuseContract(id),

  listEvents: (id: string) => api.listContractEvents(id),
}
