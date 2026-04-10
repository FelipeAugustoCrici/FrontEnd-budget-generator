import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Download, Loader2, History } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useQuoteStore } from '../stores/quoteStore'
import { useTemplateStore } from '../stores/templateStore'
import { useSettingsStore } from '../stores/settingsStore'
import { QuotePreview } from '../components/preview/QuotePreview'
import { Button } from '../components/ui/Button'
import { exportPdf } from '../hooks/usePdfExport'
import { api } from '../lib/api'
import type { Quote } from '../types'

export function Preview() {
  const navigate = useNavigate()
  const { currentQuote: quote } = useQuoteStore()
  const { templates, selectedTemplateId } = useTemplateStore()
  const { company } = useSettingsStore()
  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedVersionId, setSelectedVersionId] = useState<string>('active')

  const { data: versions = [] } = useQuery({
    queryKey: ['quotes', quote?.id, 'versions'],
    queryFn: () => api.listQuoteVersions(quote!.id),
    enabled: !!quote?.id,
  })

  const template = templates.find((t) => t.id === (quote?.templateId ?? selectedTemplateId))
    ?? templates[0]

  // build the quote to preview — either active or a specific version snapshot
  const previewQuote: Quote | null = (() => {
    if (!quote) return null
    if (selectedVersionId === 'active') return quote
    const v = versions.find((v) => v.id === selectedVersionId)
    if (!v) return quote
    return { ...quote, ...v.snapshot } as Quote
  })()

  async function handleExport() {
    if (!previewQuote || !template || loading) return
    setLoading(true)
    setError(null)
    try {
      const filename = `orcamento-${previewQuote.clientName || 'sem-cliente'}.pdf`
      await exportPdf(previewQuote, template, company, filename)
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao gerar PDF')
    } finally {
      setLoading(false)
    }
  }

  if (!quote) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-400 mb-4">Nenhum orçamento selecionado para preview.</p>
        <Button onClick={() => navigate('/quotes/new')}>Criar Orçamento</Button>
      </div>
    )
  }

  const activeVersion = versions.find((v) => v.isActive)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Preview</h1>

        {/* Version selector */}
        {versions.length > 0 && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <History size={14} className="text-gray-400 shrink-0" />
            <select
              className="text-sm bg-transparent outline-none text-gray-700 cursor-pointer"
              value={selectedVersionId}
              onChange={(e) => setSelectedVersionId(e.target.value)}
            >
              <option value="active">
                Versão ativa {activeVersion ? `(v${activeVersion.versionNumber})` : ''}
              </option>
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.versionNumber} — {new Date(v.createdAt).toLocaleDateString('pt-BR')}
                  {v.isActive ? ' ✓' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {quote.status !== 'approved' && (
          <Button variant="secondary" onClick={() => navigate(`/quotes/${quote.id}`)}>
            <Edit2 size={16} /> Editar
          </Button>
        )}
        <Button onClick={handleExport} disabled={loading}>
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Gerando...</>
            : <><Download size={16} /> Exportar PDF</>
          }
        </Button>
      </div>

      {selectedVersionId !== 'active' && (
        <div className="mb-4 px-4 py-2.5 bg-amber-50 border border-amber-100 text-amber-700 text-sm rounded-lg flex items-center gap-2">
          <History size={14} />
          Visualizando versão histórica — não é a versão ativa.
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg">
          Erro: {error}
        </div>
      )}

      {previewQuote && <QuotePreview ref={ref} quote={previewQuote} template={template} />}
    </div>
  )
}
