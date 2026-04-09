import { useState } from 'react'
import { Sparkles, Loader2, X } from 'lucide-react'
import { api } from '../../lib/api'
import { Button } from '../ui/Button'
import type { Quote } from '../../types'

interface Props {
  onApply: (data: Partial<Quote>) => void
}

export function AiQuoteGenerator({ onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<Partial<Quote> | null>(null)

  async function handleGenerate() {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setPreview(null)
    try {
      const result = await api.generateQuote(prompt)
      setPreview(result)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao gerar orçamento')
    } finally {
      setLoading(false)
    }
  }

  function handleApply() {
    if (!preview) return
    onApply(preview)
    setOpen(false)
    setPrompt('')
    setPreview(null)
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} type="button">
        <Sparkles size={15} className="text-indigo-500" />
        Gerar com IA
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-500" />
                <h2 className="font-semibold text-gray-800">Gerar Orçamento com IA</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {/* Prompt input */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Descreva o orçamento
                </label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
                  rows={4}
                  placeholder="Ex: quero um orçamento para a Tiken, vou criar uma landing page com 3 seções, estimo em 6h"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <Button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Gerando...</>
                  : <><Sparkles size={15} /> Gerar</>
                }
              </Button>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              {/* Preview */}
              {preview && (
                <div className="border border-indigo-100 bg-indigo-50 rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Sugestão gerada</p>

                  {preview.clientName && (
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Cliente</p>
                      <p className="text-sm font-medium text-gray-800">{preview.clientName}</p>
                    </div>
                  )}

                  {preview.scope && (
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Escopo</p>
                      <div
                        className="text-sm text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: preview.scope }}
                      />
                    </div>
                  )}

                  {preview.items && preview.items.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Atividades</p>
                      <div className="flex flex-col gap-1">
                        {preview.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2">
                            <span className="text-gray-700">{item.name}</span>
                            <span className="text-gray-400 text-xs">{item.estimateHours}h</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Total: {preview.items.reduce((s, i) => s + (i.estimateHours ?? 0), 0)}h
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    Revise os dados antes de aplicar. Você poderá editar tudo após aplicar.
                  </p>

                  <div className="flex gap-2">
                    <Button onClick={handleApply} className="flex-1 justify-center">
                      Aplicar ao orçamento
                    </Button>
                    <Button variant="secondary" onClick={() => setPreview(null)}>
                      Descartar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
