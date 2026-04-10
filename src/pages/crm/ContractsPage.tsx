import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye } from 'lucide-react'
import { useContracts, useCreateContract } from '../../hooks/crm/useContracts'
import { useClients } from '../../hooks/crm/useClients'
import { CrmTable } from '../../components/crm/CrmTable'
import { StatusBadge } from '../../components/crm/StatusBadge'
import { Modal } from '../../components/crm/Modal'
import { ContractForm } from '../../components/crm/ContractForm'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import type { CrmContract } from '../../lib/api'

export function ContractsPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useContracts()
  const contracts = data?.data ?? []
  const { data: clientsData } = useClients()
  const clients = clientsData?.data ?? []
  const createContract = useCreateContract()
  const [showModal, setShowModal] = useState(false)

  const columns = [
    { key: 'client', header: 'Cliente', render: (c: CrmContract) => <span className="font-medium text-gray-800">{c.client?.name ?? '—'}</span> },
    { key: 'desc', header: 'Descrição', render: (c: CrmContract) => <span className="text-gray-500 truncate max-w-xs block">{c.description}</span> },
    { key: 'value', header: 'Valor', render: (c: CrmContract) => <span className="font-medium">{c.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> },
    { key: 'status', header: 'Status', render: (c: CrmContract) => <StatusBadge type="contract" status={c.status as any} /> },
    { key: 'start', header: 'Início', render: (c: CrmContract) => <span className="text-gray-500">{c.start_date ? new Date(c.start_date).toLocaleDateString('pt-BR') : '—'}</span> },
    { key: 'end', header: 'Fim', render: (c: CrmContract) => <span className="text-gray-500">{c.end_date ? new Date(c.end_date).toLocaleDateString('pt-BR') : '—'}</span> },
    { key: 'actions', header: '', render: (c: CrmContract) => (
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="sm" onClick={() => navigate(`/crm/contracts/${c.id}`)}><Eye size={14} /></Button>
      </div>
    )},
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
          <p className="text-sm text-gray-500 mt-1">{data?.total ?? 0} contrato{(data?.total ?? 0) !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus size={16} /> Novo Contrato</Button>
      </div>

      <Card>
        <CrmTable columns={columns} data={contracts} loading={isLoading} onRowClick={(c) => navigate(`/crm/contracts/${c.id}`)} />
      </Card>

      {showModal && (
        <Modal title="Novo Contrato" onClose={() => setShowModal(false)} size="lg">
          <ContractForm
            loading={createContract.isPending}
            onSubmit={(data) => {
              createContract.mutate({
                client_id: data.clientId,
                value: data.value,
                description: data.description,
                start_date: data.startDate ? new Date(data.startDate).toISOString() : undefined,
                end_date: data.endDate ? new Date(data.endDate).toISOString() : undefined,
                auto_renew: data.autoRenew,
                status: 'draft',
              } as any, { onSuccess: () => setShowModal(false) })
            }}
          />
        </Modal>
      )}
    </div>
  )
}
