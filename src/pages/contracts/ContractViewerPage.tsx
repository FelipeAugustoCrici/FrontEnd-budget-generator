import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, CheckCircle, Lock } from 'lucide-react'
import { useContract, useContractAction } from '../../hooks/crm/useContracts'
import { useContractDocStore } from '../../stores/contractDocStore'
import { ContractViewer } from '../../components/contracts/ContractViewer'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/crm/StatusBadge'
import { Card } from '../../components/ui/Card'

export function ContractViewerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contract, isLoading } = useContract(id!)
  const { getDoc } = useContractDocStore()
  const action = useContractAction()

  const doc = id ? getDoc(id) : undefined
  const isLocked = contract?.status === 'signed'

  if (isLoading) return <div className="text-center py-20 text-gray-400">Carregando...</div>
  if (!contract) return <div className="text-center py-20 text-gray-400">Contrato não encontrado.</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/crm/contracts/${id}/document`)}>
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Visualização do Contrato</h1>
          <p className="text-sm text-gray-500">{contract.client?.name}</p>
        </div>
        <StatusBadge type="contract" status={contract.status as any} />

        {!isLocked && (
          <>
            <Button variant="secondary" onClick={() => navigate(`/crm/contracts/${id}/document`)}>
              <Edit2 size={15} /> Editar
            </Button>
            {['sent', 'viewed'].includes(contract.status) && (
              <Button
                onClick={() => action.mutate({ id: id!, action: 'sign' }, { onSuccess: () => navigate(`/crm/contracts/${id}`) })}
                disabled={action.isPending}
              >
                <CheckCircle size={15} /> Marcar como Assinado
              </Button>
            )}
          </>
        )}

        {isLocked && (
          <div className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
            <Lock size={13} /> Assinado
          </div>
        )}
      </div>

      {!doc?.content ? (
        <Card className="p-16 text-center">
          <p className="text-gray-400 text-sm">Nenhum documento gerado. Vá para o editor e gere o contrato primeiro.</p>
          <Button className="mt-4" variant="secondary" onClick={() => navigate(`/crm/contracts/${id}/document`)}>
            <Edit2 size={15} /> Ir para o editor
          </Button>
        </Card>
      ) : (
        <ContractViewer content={doc.content} />
      )}
    </div>
  )
}
