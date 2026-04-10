import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useClient } from '../../hooks/crm/useClients'
import { useContracts } from '../../hooks/crm/useContracts'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/crm/StatusBadge'
import { CrmTable } from '../../components/crm/CrmTable'
import type { CrmContract } from '../../lib/api'

const tabs = ['Contratos', 'Orçamentos', 'Histórico'] as const
type Tab = typeof tabs[number]

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: client, isLoading } = useClient(id!)
  const { data: contractsData } = useContracts({ client_id: id })
  const contracts = contractsData?.data ?? []
  const [tab, setTab] = useState<Tab>('Contratos')

  if (isLoading) return <div className="text-center py-20 text-gray-400">Carregando...</div>
  if (!client) return <div className="text-center py-20 text-gray-400">Cliente não encontrado.</div>

  const contractColumns = [
    { key: 'desc', header: 'Descrição', render: (c: CrmContract) => <span className="text-gray-700">{c.description}</span> },
    { key: 'value', header: 'Valor', render: (c: CrmContract) => <span className="font-medium">{c.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> },
    { key: 'status', header: 'Status', render: (c: CrmContract) => <StatusBadge type="contract" status={c.status as any} /> },
    { key: 'end', header: 'Vencimento', render: (c: CrmContract) => <span className="text-gray-500">{c.end_date ? new Date(c.end_date).toLocaleDateString('pt-BR') : '—'}</span> },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/crm/clients')}><ArrowLeft size={16} /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-sm text-gray-500">{client.company} · {client.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4"><p className="text-xs text-gray-400 mb-1">Telefone</p><p className="text-sm font-medium text-gray-800">{client.phone || '—'}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-400 mb-1">Contratos</p><p className="text-sm font-medium text-gray-800">{contracts.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-400 mb-1">Cliente desde</p><p className="text-sm font-medium text-gray-800">{new Date(client.created_at).toLocaleDateString('pt-BR')}</p></Card>
      </div>

      {client.notes && (
        <Card className="p-4 mb-6">
          <p className="text-xs text-gray-400 mb-1">Observações</p>
          <p className="text-sm text-gray-700">{client.notes}</p>
        </Card>
      )}

      <div className="flex gap-1 mb-4 border-b border-gray-100">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Contratos' && (
        <Card>
          <CrmTable columns={contractColumns} data={contracts} emptyMessage="Nenhum contrato para este cliente." onRowClick={(c) => navigate(`/crm/contracts/${c.id}`)} />
        </Card>
      )}
      {tab === 'Orçamentos' && (
        <Card className="p-8 text-center text-gray-400 text-sm">Integração com orçamentos em breve.</Card>
      )}
      {tab === 'Histórico' && (
        <Card className="p-8 text-center text-gray-400 text-sm">Histórico de atividades em breve.</Card>
      )}
    </div>
  )
}
