import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Save, Eye, ArrowLeft, Trash2, LayoutTemplate, Check } from 'lucide-react'
import { useQuoteStore } from '../../stores/quoteStore'
import { useTemplateStore } from '../../stores/templateStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { LogoUpload } from '../ui/LogoUpload'
import { CurrencyInput } from '../ui/CurrencyInput'
import { RichTextEditor } from '../ui/RichTextEditor'
import { AiQuoteGenerator } from './AiQuoteGenerator'
import { formatCurrency, STATUS_LABELS, STATUS_COLORS } from '../../utils/quote'
import { BLOCK_LABELS } from '../../utils/template'
import type { Quote, QuoteItem } from '../../types'

interface Props {
  initialQuote: Quote
  title: string
}

export function QuoteForm({ initialQuote, title }: Props) {
  const navigate = useNavigate()
  const { setCurrentQuote, saveQuote } = useQuoteStore()
  const { templates } = useTemplateStore()
  const [quote, setQuote] = useState<Quote>(initialQuote)
  const goingToPreview = useRef(false)

  useEffect(() => {
    return () => {
      if (!goingToPreview.current) {
        setCurrentQuote(null)
      }
    }
  }, [])

  function updateItem(updated: QuoteItem) {
    setQuote((q) => ({ ...q, items: q.items.map((i) => (i.id === updated.id ? updated : i)) }))
  }

  function addItem() {
    setQuote((q) => ({
      ...q,
      items: [...q.items, { id: crypto.randomUUID(), name: '', quantity: 1, unitPrice: 0, estimateHours: 1, itemStatus: 'Aguard. Aprovação' }],
    }))
  }

  function removeItem(itemId: string) {
    setQuote((q) => ({ ...q, items: q.items.filter((i) => i.id !== itemId) }))
  }

  function handleSave() {
    saveQuote(quote)
    navigate('/quotes')
  }

  function handlePreview() {
    goingToPreview.current = true
    setCurrentQuote(quote)
    saveQuote(quote)
    navigate('/preview')
  }

  const totalHours = quote.items.reduce((s, i) => s + (i.estimateHours ?? i.quantity), 0)
  const rate = Number(quote.hourlyRate ?? 0)
  const grandTotal = rate > 0
    ? totalHours * rate
    : quote.items.reduce((s, i) => s + (i.estimateHours ?? i.quantity) * Number(i.unitPrice ?? 0), 0)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/quotes')}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">{title}</h1>
        <Badge className={STATUS_COLORS[quote.status]}>{STATUS_LABELS[quote.status]}</Badge>
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
          value={quote.status}
          onChange={(e) => setQuote((q) => ({ ...q, status: e.target.value as Quote['status'] }))}
        >
          {(['draft', 'sent', 'approved', 'rejected'] as Quote['status'][]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <Button variant="secondary" onClick={handlePreview}>
          <Eye size={16} /> Preview
        </Button>
        <Button onClick={handleSave}><Save size={16} /> Salvar</Button>
      </div>

      {/* AI bar */}
      <AiQuoteGenerator onApply={(data) => setQuote((q) => ({
        ...q,
        ...data,
        items: data.items && data.items.length > 0 ? data.items : q.items,
      }))} />

      {/* Template selector */}
      <Card className="p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <LayoutTemplate size={16} className="text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-700">Template</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {templates.map((t) => {
            const isSelected = quote.templateId === t.id
            return (
              <button
                key={t.id}
                onClick={() => setQuote((q) => ({ ...q, templateId: t.id }))}
                className={`relative flex flex-col gap-1.5 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-white hover:border-gray-300'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-0.5">
                    <Check size={10} />
                  </span>
                )}
                <span className={`text-sm font-semibold ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {t.name}
                </span>
                <div className="flex flex-wrap gap-1">
                  {t.blocks.filter((b) => b.visible).slice(0, 3).map((b) => (
                    <span key={b.id} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {BLOCK_LABELS[b.type]}
                    </span>
                  ))}
                  {t.blocks.filter((b) => b.visible).length > 3 && (
                    <span className="text-[10px] text-gray-400">+{t.blocks.filter((b) => b.visible).length - 3}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Company info */}
      <Card className="p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Dados da Empresa</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nome da empresa"
            value={quote.companyName ?? ''}
            onChange={(e) => setQuote((q) => ({ ...q, companyName: e.target.value }))}
            placeholder="Ex: Trinity Web"
          />
          <LogoUpload
            value={quote.companyLogo ?? ''}
            onChange={(base64) => setQuote((q) => ({ ...q, companyLogo: base64 }))}
          />
        </div>
      </Card>

      {/* Client info */}
      <Card className="p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Dados do Cliente</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nome do cliente / projeto"
            value={quote.clientName}
            onChange={(e) => setQuote((q) => ({ ...q, clientName: e.target.value }))}
            placeholder="Ex: Tiken"
          />
          <Input
            label="Data"
            type="date"
            value={quote.date}
            onChange={(e) => setQuote((q) => ({ ...q, date: e.target.value }))}
          />
        </div>
        <div className="mt-4">
          <RichTextEditor
            label="Escopo / Descrição do projeto"
            value={quote.scope ?? ''}
            onChange={(html) => setQuote((q) => ({ ...q, scope: html }))}
          />
        </div>
      </Card>

      {/* Activities */}
      <Card className="p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Atividades</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left pb-2 text-gray-500 font-medium">Atividade</th>
              <th className="text-left pb-2 text-gray-500 font-medium w-24">Horas</th>
              <th className="text-left pb-2 text-gray-500 font-medium w-40">Status</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 group">
                <td className="py-2 pr-3">
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Descrição da atividade"
                    value={item.name}
                    onChange={(e) => updateItem({ ...item, name: e.target.value })}
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="number" min={0} step={0.5}
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    value={item.estimateHours ?? item.quantity}
                    onChange={(e) => updateItem({ ...item, estimateHours: Number(e.target.value), quantity: Number(e.target.value) })}
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Aguard. Aprovação"
                    value={item.itemStatus ?? ''}
                    onChange={(e) => updateItem({ ...item, itemStatus: e.target.value })}
                  />
                </td>
                <td className="py-2">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button variant="ghost" size="sm" className="mt-3" onClick={addItem}>
          <Plus size={14} /> Adicionar atividade
        </Button>
      </Card>

      {/* Financial summary */}
      <Card className="p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Resumo Financeiro</h2>
        <div className="grid grid-cols-2 gap-4">
          <CurrencyInput
            label="Valor por hora"
            value={quote.hourlyRate ?? 0}
            onChange={(v) => setQuote((q) => ({ ...q, hourlyRate: v }))}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Total estimado</label>
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800">
              {formatCurrency(grandTotal)} ({totalHours}h)
            </div>
          </div>
        </div>
      </Card>

      {/* Conditions */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Condições</h2>
        <RichTextEditor
          value={quote.conditions ?? ''}
          onChange={(html) => setQuote((q) => ({ ...q, conditions: html }))}
        />
      </Card>
    </div>
  )
}
