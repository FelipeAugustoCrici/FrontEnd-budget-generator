import { useState } from 'react'
import { FileText } from 'lucide-react'
import { Modal } from './Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useCreateContract } from '../../hooks/crm/useContracts'
import { useClients } from '../../hooks/crm/useClients'
import { useQueryClient } from '@tanstack/react-query'
import type { Quote } from '../../types'

interface Props {
  quote: Quote
  onClose: () => void
  onSuccess: () => void
}

export function ConvertToContractModal({ quote, onClose, onSuccess }: Props) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const createContract = useCreateContract()
  const { data: clientsData } = useClients()
  const clients = clientsData?.data ?? []
  const qc = useQueryClient()

  const totalHours = quote.items.reduce((s, i) => s + (i.estimateHours ?? i.quantity), 0)
  const rate = Number(quote.hourlyRate ?? 0)
  const value = rate > 0
    ? totalHours * rate
    : quote.items.reduce((s, i) => s + (i.estimateHours ?? i.quantity) * Number(i.unitPrice ?? 0), 0)

  // find matching client by name
  const matchedClient = clients.find(
    (c) => c.name.toLowerCase() === quote.clientName.toLowerCase()
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!startDate || !endDate) { setError('Informe as duas datas.'); return }
    if (!matchedClient) { setError(`Cliente "${quote.clientName}" não encontrado no CRM. Cadastre-o primeiro.`); return }

    createContract.mutate({
      client_id: matchedClient.id,
      value,
      description: quote.scope?.replace(/<[^>]+>/g, '').trim() || `Orçamento: ${quote.clientName}`,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      auto_renew: false,
      status: 'draft',
      budget_id: quote.id,
    } as any, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['contracts', 'by-budget', quote.id] })
        onSuccess()
        onClose()
      },
      onError: (err: any) => setError(err.message ?? 'Erro ao criar contrato'),
    })
  }

  return (
    <Modal title="Converter em Contrato" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Cliente</span>
            <span className="font-medium text-gray-800">{quote.clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Valor</span>
            <span className="font-medium text-gray-800">{value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          {!matchedClient && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mt-1">
              Cliente não encontrado no CRM. Cadastre-o na seção Clientes antes de converter.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data de início"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Data de término"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <Button type="submit" disabled={createContract.isPending || !matchedClient} className="justify-center">
            <FileText size={15} />
            {createContract.isPending ? 'Criando...' : 'Criar Contrato'}
          </Button>
        </form>
      </div>
    </Modal>
  )
}
