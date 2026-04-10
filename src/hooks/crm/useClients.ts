import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientService } from '../../services/crm/clientService'
import type { CrmClient } from '../../lib/api'

export const clientKeys = {
  all: ['clients'] as const,
  list: (params?: object) => ['clients', 'list', params] as const,
  detail: (id: string) => ['clients', id] as const,
}

export function useClients(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientService.listPaginated(params),
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientService.get(id),
    enabled: !!id,
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<CrmClient, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
      clientService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.all }),
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CrmClient> }) =>
      clientService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: clientKeys.all })
      qc.invalidateQueries({ queryKey: clientKeys.detail(id) })
    },
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.all }),
  })
}
