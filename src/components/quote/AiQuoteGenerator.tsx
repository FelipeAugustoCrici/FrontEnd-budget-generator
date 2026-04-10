import { useState } from 'react'
import { Sparkles, Loader2, Check, X } from 'lucide-react'
import { api } from '../../lib/api'
import { useClients, useCreateClient } from '../../hooks/crm/useClients'
import type { Quote } from '../../types'

interface Props {
  onApply: (data: Partial<Quote>) => void
}

export function AiQuoteGenerator({ onApply }: Props) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<Partial<Quote> | null>(null)
  const { data: clientsData } = useClients()
  const createClient = useCreateClient()

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError(null)
    setPreview(null)
    try {
      const result = await api.generateQuote(prompt)
      setPreview(result)
    } catch (err: any) {
      setError(err.message ?? 'Erro ao gerar orçamento')
    } finally {
      setLoading(false)
    }
  }

  function handleApply() {
    if (!preview) return

    // Se a IA retornou um clientName e ele não existe no CRM, cria automaticamente
    if (preview.clientName) {
      const exists = clientsData?.data?.some(
        (c) => c.name.toLowerCase() === preview.clientName!.toLowerCase()
      )
      if (!exists) {
        createClient.mutate({ name: preview.clientName, company: '', email: '', phone: '', notes: '' })
      }
    }

    onApply(preview)
    setPreview(null)
    setPrompt('')
  }

  function handleDiscard() {
    setPreview(null)
    setPrompt('')
    setError(null)
  }

  return (
    <div className="mb-5 flex flex-col gap-2">
      {/* Input bar */}
      <form onSubmit={handleGenerate}>
        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition">
          {loading
            ? <Loader2 size={15} className="text-indigo-500 animate-spin shrink-0" />
            : <Sparkles size={15} className="text-indigo-500 shrink-0" />
          }
          <input
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            placeholder='Descreva o orçamento com IA — Ex: "landing page para a Tiken, 3 seções, estimo 6h"'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          {!loading && prompt && (
            <button
              type="submit"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0 transition-colors"
            >
              Gerar →
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1 px-1">{error}</p>
        )}
      </form>

      {/* Preview */}
      {preview && (
        <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles size={11} /> Sugestão da IA
            </span>
            <button onClick={handleDiscard} className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors">
              <X size={14} />
            </button>
          </div>

          {preview.clientName && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Cliente</p>
              <p className="text-sm font-medium text-gray-800">{preview.clientName}</p>
            </div>
          )}

          {preview.items && preview.items.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Atividades</p>
              <div className="flex flex-col gap-1">
                {preview.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-700">{item.name}</span>
                    <span className="text-xs text-indigo-600 font-medium">{item.estimateHours}h</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Total: <span className="text-gray-700 font-medium">
                  {preview.items.reduce((s, i) => s + (i.estimateHours ?? 0), 0)}h
                </span>
                {preview.hourlyRate ? (
                  <span className="ml-2 text-indigo-600 font-medium">
                    · R$ {preview.hourlyRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/h
                    · Total: R$ {(preview.items.reduce((s, i) => s + (i.estimateHours ?? 0), 0) * preview.hourlyRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                ) : null}
              </p>
            </div>
          )}

          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            Revise os dados — você poderá editar tudo após aplicar.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg py-2 transition-colors"
            >
              <Check size={14} /> Aplicar ao orçamento
            </button>
            <button
              onClick={handleDiscard}
              className="px-4 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
