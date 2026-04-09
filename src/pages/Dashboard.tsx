import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, CheckCircle, Clock, XCircle, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { useQuoteStore } from '../stores/quoteStore'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from '../utils/quote'
import type { Quote } from '../types'

function quoteTotal(q: Quote) {
  const hours = q.items.reduce((s, i) => s + (i.estimateHours ?? i.quantity), 0)
  const rate = Number(q.hourlyRate ?? 0)
  return rate > 0 ? hours * rate : q.items.reduce((s, i) => s + (i.estimateHours ?? i.quantity) * Number(i.unitPrice ?? 0), 0)
}

export function Dashboard() {
  const navigate = useNavigate()
  const { quotes, setCurrentQuote, fetchQuotes } = useQuoteStore()

  useEffect(() => { fetchQuotes() }, [])

  const total = quotes.length
  const approved = quotes.filter((q) => q.status === 'approved').length
  const pending = quotes.filter((q) => q.status === 'draft' || q.status === 'sent').length
  const rejected = quotes.filter((q) => q.status === 'rejected').length
  const totalRevenue = quotes.filter((q) => q.status === 'approved').reduce((s, q) => s + quoteTotal(q), 0)
  const recent = [...quotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  function handleNew() {
    navigate('/quotes/new')
  }

  const stats = [
    { label: 'Total de Orçamentos', value: total, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Aprovados', value: approved, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Em Aberto', value: pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Rejeitados', value: rejected, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Visão geral dos seus orçamentos</p>
        </div>
        <Button onClick={handleNew}>
          <Plus size={16} /> Novo Orçamento
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{label}</span>
              <div className={`${bg} p-2 rounded-lg`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </Card>
        ))}
      </div>

      {/* Revenue card */}
      <Card className="p-5 mb-6 flex items-center gap-4">
        <div className="bg-indigo-50 p-3 rounded-xl">
          <TrendingUp size={22} className="text-indigo-500" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Receita aprovada</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
        </div>
      </Card>

      {/* Recent quotes */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Orçamentos recentes</h2>
          <button
            onClick={() => navigate('/quotes')}
            className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
          >
            Ver todos <ArrowRight size={13} />
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            Nenhum orçamento ainda.
          </div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {recent.map((quote) => (
                <tr
                  key={quote.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => { setCurrentQuote(quote); navigate(`/quotes/${quote.id}`) }}
                >
                  <td className="px-5 py-3.5 font-medium text-gray-800">{quote.clientName || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-400">{formatDate(quote.date)}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={STATUS_COLORS[quote.status]}>{STATUS_LABELS[quote.status]}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-gray-800">{formatCurrency(quoteTotal(quote))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
