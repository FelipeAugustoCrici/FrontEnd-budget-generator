import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contractService } from '../../services/crm/contractService'
import { api } from '../../lib/api'
import type { CrmContract } from '../../lib/api'

export const contractKeys = {
  all: ['contracts'] as const,
  list: (params?: object) => ['contracts', 'list', params] as const,
  detail: (id: string) => ['contracts', id] as const,
  events: (id: string) => ['contracts', id, 'events'] as const,
}

export function useContracts(params?: { client_id?: string; status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: contractKeys.list(params),
    queryFn: () => contractService.listPaginated(params),
  })
}

export function useContract(id: string) {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: () => contractService.get(id),
    enabled: !!id,
  })
}

export function useContractByBudget(budgetId: string) {
  return useQuery({
    queryKey: ['contracts', 'by-budget', budgetId],
    queryFn: async () => {
      try {
        return await api.getContractByBudget(budgetId)
      } catch {
        return null
      }
    },
    enabled: !!budgetId,
    retry: false,
    staleTime: 0,
  })
}

export function useContractEvents(id: string) {
  return useQuery({
    queryKey: contractKeys.events(id),
    queryFn: () => contractService.listEvents(id),
    enabled: !!id,
  })
}

export function useCreateContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<CrmContract, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'client'>) =>
      contractService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: contractKeys.all }),
  })
}

export function useUpdateContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CrmContract> }) =>
      contractService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: contractKeys.all })
      qc.invalidateQueries({ queryKey: contractKeys.detail(id) })
    },
  })
}

export function useContractAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'send' | 'view' | 'sign' | 'refuse' }) =>
      contractService[action](id),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: contractKeys.all })
      qc.invalidateQueries({ queryKey: contractKeys.detail(id) })
      qc.invalidateQueries({ queryKey: contractKeys.events(id) })
    },
  })
}
