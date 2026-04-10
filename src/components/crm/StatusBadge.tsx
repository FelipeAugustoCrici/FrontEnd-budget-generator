import type { ContractStatus, ClientStatus } from '../../types/crm'

const CONTRACT_STYLES: Record<ContractStatus, string> = {
  draft:   'bg-gray-100 text-gray-600',
  sent:    'bg-blue-100 text-blue-600',
  viewed:  'bg-purple-100 text-purple-600',
  signed:  'bg-green-100 text-green-600',
  refused: 'bg-red-100 text-red-600',
  expired: 'bg-gray-800 text-gray-200',
}

const CONTRACT_LABELS: Record<ContractStatus, string> = {
  draft: 'Rascunho', sent: 'Enviado', viewed: 'Visualizado',
  signed: 'Assinado', refused: 'Recusado', expired: 'Expirado',
}

const CLIENT_STYLES: Record<ClientStatus, string> = {
  active: 'bg-green-100 text-green-600',
  inactive: 'bg-gray-100 text-gray-500',
}

const CLIENT_LABELS: Record<ClientStatus, string> = {
  active: 'Ativo', inactive: 'Inativo',
}

interface ContractBadgeProps { status: ContractStatus; type: 'contract' }
interface ClientBadgeProps { status: ClientStatus; type: 'client' }
type Props = ContractBadgeProps | ClientBadgeProps

export function StatusBadge(props: Props) {
  const className = props.type === 'contract'
    ? CONTRACT_STYLES[props.status]
    : CLIENT_STYLES[props.status]
  const label = props.type === 'contract'
    ? CONTRACT_LABELS[props.status]
    : CLIENT_LABELS[props.status]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
