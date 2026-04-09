import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2, Edit2, Eye } from 'lucide-react'
import { useQuoteStore } from '../stores/quoteStore'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { STATUS_LABELS, STATUS_COLORS, formatCurrency, formatDate } from '../utils/quote'
import type { Quote } from '../types'

const ALL_STATUSES: Quote['status'][] = ['draft', 'sent', 'approved', 'rejected']

export function QuoteList() {
  const navigate = useNavigate()
  const { quotes, deleteQuote, setCurrentQuote, fetchQuotes } = useQuoteStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Quote['status'] | 'all'>('all')

  useEffect(() => { fetchQuotes() }, [])

  const filtered = quotes.filter((q) => {
    const matchSearch = q.clientName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || q.status === statusFilter
    return matchSearch && matchStatus
  })

  function handleNew() {
    navigate('/quotes/new')
  }

  function handleEdit(quote: Quote) {
    setCurrentQuote(quote)
    navigate(`/quotes/${quote.id}`)
  }

  function handlePreview(quote: Quote) {
    setCurrentQuote(quote)
    navigate('/preview')
  }

  // total value per quote
  function quoteTotal(q: Quote) {
    const hours = q.items.reduce((s, i) => s + (i.estimateHours ?? i.quantity), 0)
    const rate = Number(q.hourlyRate ?? 0)
    return rate > 0 ? hours * rate : q.items.reduce((s, i) => s + (i.estimateHours ?? i.quantity) * Number(i.unitPrice ?? 0), 0)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-sm text-gray-500 mt-1">{quotes.length} orçamento{quotes.length !== 1 ? 's' : ''} no total</p>
        </div>
        <Button onClick={handleNew}>
          <Plus size={16} /> Novo Orçamento
        </Button>
      </div>

      <Card className="mb-6 p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Todos
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-16 text-center">
          <p className="text-gray-400 text-sm">Nenhum orçamento encontrado.</p>
          <Button className="mt-4" onClick={handleNew}><Plus size={16} /> Criar primeiro orçamento</Button>
        </Card>
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Cliente</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Data</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">Total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((quote) => (
                <tr key={quote.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{quote.clientName || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-500">{formatDate(quote.date)}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={STATUS_COLORS[quote.status]}>{STATUS_LABELS[quote.status]}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-gray-800">{formatCurrency(quoteTotal(quote))}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handlePreview(quote)}>
                        <Eye size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(quote)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteQuote(quote.id)}>
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
