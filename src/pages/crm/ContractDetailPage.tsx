import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, CheckCircle, ExternalLink } from 'lucide-react'
import { useContract, useContractEvents, useContractAction } from '../../hooks/crm/useContracts'
import { useQuoteStore } from '../../stores/quoteStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/crm/StatusBadge'
import { Timeline } from '../../components/crm/Timeline'

export function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contract, isLoading } = useContract(id!)
  const { data: events = [] } = useContractEvents(id!)
  const action = useContractAction()
  const { quotes } = useQuoteStore()
  const linkedQuote = contract?.budget_id ? quotes.find((q) => q.id === contract.budget_id) : null

  if (isLoading) return <div className="text-center py-20 text-gray-400">Carregando...</div>
  if (!contract) return <div className="text-center py-20 text-gray-400">Contrato não encontrado.</div>

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'

  const timelineEvents = events.map((e) => ({
    id: e.id,
    type: e.type as any,
    date: e.created_at,
  }))

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/crm/contracts')}><ArrowLeft size={16} /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{contract.client?.name ?? '—'}</h1>
          <p className="text-sm text-gray-500">{contract.description}</p>
        </div>
        <StatusBadge type="contract" status={contract.status as any} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4"><p className="text-xs text-gray-400 mb-1">Valor</p><p className="text-sm font-bold text-gray-900">{fmt(contract.value)}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-400 mb-1">Início</p><p className="text-sm font-medium text-gray-800">{fmtDate(contract.start_date)}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-400 mb-1">Vencimento</p><p className="text-sm font-medium text-gray-800">{fmtDate(contract.end_date)}</p></Card>
      </div>

      {linkedQuote && (
        <Card className="p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Orçamento vinculado</p>
            <p className="text-sm font-medium text-gray-800">{linkedQuote.clientName} — {fmtDate(linkedQuote.date)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/quotes/${linkedQuote.id}`)}>
            <ExternalLink size={14} /> Ver orçamento
          </Button>
        </Card>
      )}

      <Card className="p-5 mb-6 flex gap-3 flex-wrap">
        {contract.status === 'draft' && (
          <Button onClick={() => action.mutate({ id: contract.id, action: 'send' })} disabled={action.isPending}>
            <Send size={15} /> Enviar Contrato
          </Button>
        )}
        {contract.status === 'sent' && (
          <Button variant="secondary" onClick={() => action.mutate({ id: contract.id, action: 'view' })} disabled={action.isPending}>
            Marcar como Visualizado
          </Button>
        )}
        {['sent', 'viewed'].includes(contract.status) && (
          <Button onClick={() => action.mutate({ id: contract.id, action: 'sign' })} disabled={action.isPending}>
            <CheckCircle size={15} /> Marcar como Assinado
          </Button>
        )}
        {['sent', 'viewed'].includes(contract.status) && (
          <Button variant="danger" onClick={() => action.mutate({ id: contract.id, action: 'refuse' })} disabled={action.isPending}>
            Marcar como Recusado
          </Button>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h2>
        <Timeline events={timelineEvents} />
      </Card>
    </div>
  )
}
