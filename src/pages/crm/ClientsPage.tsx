import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Eye, Trash2 } from 'lucide-react'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../../hooks/crm/useClients'
import { CrmTable } from '../../components/crm/CrmTable'
import { Modal } from '../../components/crm/Modal'
import { ClientForm } from '../../components/crm/ClientForm'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import type { CrmClient } from '../../lib/api'

export function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data, isLoading } = useClients({ search })
  const clients = data?.data ?? []
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()
  const [modal, setModal] = useState<'create' | { type: 'edit'; client: CrmClient } | null>(null)

  const columns = [
    { key: 'name', header: 'Nome', render: (c: CrmClient) => <span className="font-medium text-gray-800">{c.name}</span> },
    { key: 'company', header: 'Empresa', render: (c: CrmClient) => <span className="text-gray-600">{c.company}</span> },
    { key: 'email', header: 'E-mail', render: (c: CrmClient) => <span className="text-gray-500">{c.email}</span> },
    { key: 'phone', header: 'Telefone', render: (c: CrmClient) => <span className="text-gray-500">{c.phone}</span> },
    {
      key: 'actions', header: '', render: (c: CrmClient) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/crm/clients/${c.id}`)}><Eye size={14} /></Button>
          <Button variant="ghost" size="sm" onClick={() => setModal({ type: 'edit', client: c })}><Edit2 size={14} /></Button>
          <Button variant="ghost" size="sm" onClick={() => deleteClient.mutate(c.id)}><Trash2 size={14} className="text-red-400" /></Button>
        </div>
      )
    },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">{data?.total ?? 0} cliente{(data?.total ?? 0) !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setModal('create')}><Plus size={16} /> Novo Cliente</Button>
      </div>

      <Card className="mb-5 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-indigo-400"
            placeholder="Buscar por nome, empresa ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <CrmTable columns={columns} data={clients} loading={isLoading} onRowClick={(c) => navigate(`/crm/clients/${c.id}`)} />
      </Card>

      {modal === 'create' && (
        <Modal title="Novo Cliente" onClose={() => setModal(null)}>
          <ClientForm
            loading={createClient.isPending}
            onSubmit={(data) => createClient.mutate(data as any, { onSuccess: () => setModal(null) })}
          />
        </Modal>
      )}

      {modal && typeof modal === 'object' && modal.type === 'edit' && (
        <Modal title="Editar Cliente" onClose={() => setModal(null)}>
          <ClientForm
            initial={modal.client as any}
            loading={updateClient.isPending}
            onSubmit={(data) => updateClient.mutate({ id: modal.client.id, data }, { onSuccess: () => setModal(null) })}
          />
        </Modal>
      )}
    </div>
  )
}
