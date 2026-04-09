import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Copy, Trash2, Star, Eye, X } from 'lucide-react'
import { useTemplateStore } from '../stores/templateStore'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { QuotePreview } from '../components/preview/QuotePreview'
import { BLOCK_LABELS } from '../utils/template'
import type { Template } from '../types'

// Dummy quote for preview purposes
import { createEmptyQuote } from '../stores/quoteStore'

const DUMMY_QUOTE = {
  ...createEmptyQuote('preview'),
  clientName: 'Cliente Exemplo',
  companyName: 'Sua Empresa',
  scope: 'Implementação de funcionalidades conforme escopo acordado.',
  conditions: 'O valor acima considera o escopo descrito neste documento.',
  hourlyRate: 90,
  items: [
    { id: '1', name: 'Desenvolvimento frontend', quantity: 4, unitPrice: 0, estimateHours: 4, itemStatus: 'Aguard. Aprovação' },
    { id: '2', name: 'Testes e ajustes', quantity: 2, unitPrice: 0, estimateHours: 2, itemStatus: 'Aguard. Aprovação' },
  ],
}

export function Templates() {
  const navigate = useNavigate()
  const { templates, deleteTemplate, duplicateTemplate, fetchTemplates } = useTemplateStore()
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  useEffect(() => { fetchTemplates() }, [])

  async function handleNew() {
    const id = crypto.randomUUID()
    const { saveTemplate } = useTemplateStore.getState()
    await saveTemplate({
      id,
      name: 'Novo Template',
      isDefault: false,
      createdAt: new Date().toISOString(),
      blocks: [
        { id: crypto.randomUUID(), type: 'header', content: 'Orçamento – {{client_name}}', align: 'center', visible: true },
        { id: crypto.randomUUID(), type: 'scope', visible: true },
        { id: crypto.randomUUID(), type: 'items_table', visible: true },
        { id: crypto.randomUUID(), type: 'financial_summary', visible: true },
        { id: crypto.randomUUID(), type: 'conditions', visible: true },
        { id: crypto.randomUUID(), type: 'footer', visible: true },
      ],
    })
    navigate(`/templates/${id}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-sm text-gray-500 mt-1">{templates.length} template{templates.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={handleNew}>
          <Plus size={16} /> Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">{template.name}</h3>
                {template.isDefault && (
                  <Badge className="bg-amber-50 text-amber-600">
                    <Star size={10} className="mr-1" /> Padrão
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" title="Preview" onClick={() => setPreviewTemplate(template)}>
                  <Eye size={14} />
                </Button>
                <Button variant="ghost" size="sm" title="Editar" onClick={() => navigate(`/templates/${template.id}`)}>
                  <Edit2 size={14} />
                </Button>
                <Button variant="ghost" size="sm" title="Duplicar" onClick={() => duplicateTemplate(template.id)}>
                  <Copy size={14} />
                </Button>
                {!template.isDefault && (
                  <Button variant="ghost" size="sm" title="Excluir" onClick={() => deleteTemplate(template.id)}>
                    <Trash2 size={14} className="text-red-400" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {template.blocks.filter((b) => b.visible).map((block) => (
                <span key={block.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                  {BLOCK_LABELS[block.type]}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {template.blocks.filter((b) => b.visible).length} blocos ativos
            </p>
          </Card>
        ))}
      </div>

      {/* Preview modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-8 overflow-y-auto"
          onClick={() => setPreviewTemplate(null)}
        >
          <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-sm">Preview — {previewTemplate.name}</span>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-white/70 hover:text-white p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <QuotePreview quote={DUMMY_QUOTE} template={previewTemplate} />
          </div>
        </div>
      )}
    </div>
  )
}
