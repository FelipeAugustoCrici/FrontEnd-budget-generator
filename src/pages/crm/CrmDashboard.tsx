import { Users, FileText, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { useClients } from '../../hooks/crm/useClients'
import { useContracts } from '../../hooks/crm/useContracts'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/crm/StatusBadge'
import { useNavigate } from 'react-router-dom'

export function CrmDashboard() {
  const navigate = useNavigate()
  const { data: clientsData } = useClients()
  const { data: contractsData } = useContracts()
  const clients = clientsData?.data ?? []
  const contracts = contractsData?.data ?? []

  const activeContracts = contracts.filter((c) => c.status === 'signed').length
  const pendingContracts = contracts.filter((c) => ['draft', 'sent', 'viewed'].includes(c.status)).length
  const totalRevenue = contracts.filter((c) => c.status === 'signed').reduce((s, c) => s + c.value, 0)

  const stats = [
    { label: 'Total de Clientes', value: clientsData?.total ?? 0, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Contratos Ativos', value: activeContracts, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Contratos Pendentes', value: pendingContracts, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Receita Total', value: totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral de clientes e contratos</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{label}</span>
              <div className={`${bg} p-2 rounded-lg`}><Icon size={16} className={color} /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Contratos recentes</h2>
          <button onClick={() => navigate('/crm/contracts')} className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
            Ver todos <ArrowRight size={13} />
          </button>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {contracts.slice(0, 5).map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate(`/crm/contracts/${c.id}`)}>
                <td className="px-5 py-3.5 font-medium text-gray-800">{c.client?.name ?? '—'}</td>
                <td className="px-5 py-3.5 text-gray-500">{c.description?.slice(0, 40)}{c.description?.length > 40 ? '...' : ''}</td>
                <td className="px-5 py-3.5"><StatusBadge type="contract" status={c.status as any} /></td>
                <td className="px-5 py-3.5 text-right font-medium text-gray-800">{c.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
