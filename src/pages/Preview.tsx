import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Download, Loader2 } from 'lucide-react'
import { useQuoteStore } from '../stores/quoteStore'
import { useTemplateStore } from '../stores/templateStore'
import { useSettingsStore } from '../stores/settingsStore'
import { QuotePreview } from '../components/preview/QuotePreview'
import { Button } from '../components/ui/Button'
import { exportPdf } from '../hooks/usePdfExport'

export function Preview() {
  const navigate = useNavigate()
  const { currentQuote: quote } = useQuoteStore()
  const { templates, selectedTemplateId } = useTemplateStore()
  const { company } = useSettingsStore()
  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const template = templates.find((t) => t.id === (quote?.templateId ?? selectedTemplateId))
    ?? templates[0]

  async function handleExport() {
    if (!quote || !template || loading) return
    setLoading(true)
    setError(null)
    try {
      const filename = `orcamento-${quote.clientName || 'sem-cliente'}.pdf`
      await exportPdf(quote, template, company, filename)
    } catch (e: any) {
      console.error('PDF export error:', e)
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Preview</h1>
        <Button variant="secondary" onClick={() => navigate(`/quotes/${quote.id}`)}>
          <Edit2 size={16} /> Editar
        </Button>
        <Button onClick={handleExport} disabled={loading}>
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Gerando...</>
            : <><Download size={16} /> Exportar PDF</>
          }
        </Button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg">
          Erro: {error}
        </div>
      )}

      <QuotePreview ref={ref} quote={quote} template={template} />
    </div>
  )
}
