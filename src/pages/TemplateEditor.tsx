import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Save } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useTemplateStore } from '../stores/templateStore'
import { BlockEditor } from '../components/template/BlockEditor'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { BlockType, TemplateBlock } from '../types'
import { BLOCK_LABELS } from '../utils/template'

const AVAILABLE_BLOCKS: BlockType[] = ['header', 'scope', 'client_info', 'items_table', 'financial_summary', 'conditions', 'totals', 'notes', 'signature', 'footer']

export function TemplateEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { templates, saveTemplate } = useTemplateStore()
  const template = templates.find((t) => t.id === id)

  const [name, setName] = useState(template?.name ?? '')
  const [blocks, setBlocks] = useState<TemplateBlock[]>(template?.blocks ?? [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (!template) return <p className="text-gray-500">Template não encontrado.</p>

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  function addBlock(type: BlockType) {
    const newBlock: TemplateBlock = {
      id: crypto.randomUUID(),
      type,
      visible: true,
      ...(type === 'header' ? { content: 'Orçamento - {{client_name}}', align: 'center' } : {}),
    }
    setBlocks((b) => [...b, newBlock])
  }

  function handleSave() {
    if (!template) return
    saveTemplate({ id: template.id, isDefault: template.isDefault, createdAt: template.createdAt, name, blocks })
    navigate('/templates')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/templates')}>
          <ArrowLeft size={16} />
        </Button>
        <input
          className="flex-1 text-2xl font-bold text-gray-900 bg-transparent outline-none border-b-2 border-transparent focus:border-indigo-300 transition-colors"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={handleSave}>
          <Save size={16} /> Salvar Template
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">Blocos do Template</h2>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {blocks.map((block) => (
                  <BlockEditor
                    key={block.id}
                    block={block}
                    onChange={(updated) => setBlocks((bs) => bs.map((b) => (b.id === updated.id ? updated : b)))}
                    onRemove={() => setBlocks((bs) => bs.filter((b) => b.id !== block.id))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {blocks.length === 0 && (
            <Card className="p-10 text-center text-gray-400 text-sm">
              Adicione blocos ao template usando o painel ao lado.
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">Adicionar Bloco</h2>
          <Card className="p-4 flex flex-col gap-2">
            {AVAILABLE_BLOCKS.map((type) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left"
              >
                <Plus size={14} />
                {BLOCK_LABELS[type]}
              </button>
            ))}
          </Card>

          <Card className="p-4 mt-4">
            <h3 className="text-xs font-semibold text-gray-500 mb-2">Variáveis disponíveis</h3>
            <div className="flex flex-col gap-1">
              {['{{client_name}}', '{{date}}', '{{subtotal}}', '{{discount}}', '{{total}}', '{{notes}}'].map((v) => (
                <code key={v} className="text-xs bg-gray-50 text-indigo-600 px-2 py-1 rounded">{v}</code>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
