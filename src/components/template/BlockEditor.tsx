import { GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { TemplateBlock } from '../../types'
import { BLOCK_LABELS } from '../../utils/template'

interface Props {
  block: TemplateBlock
  onChange: (block: TemplateBlock) => void
  onRemove: () => void
}

export function BlockEditor({ block, onChange, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const hasContent = block.type === 'header'
  const hasTextarea = block.type === 'scope' || block.type === 'conditions'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
    >
      <button
        className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </button>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{BLOCK_LABELS[block.type]}</span>
          <div className="flex items-center gap-1">
            {block.align !== undefined && (
              <div className="flex gap-1 mr-1">
                {(['left', 'center', 'right'] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => onChange({ ...block, align: a })}
                    className={`px-2 py-0.5 text-xs rounded ${block.align === a ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    {a === 'left' ? '←' : a === 'center' ? '↔' : '→'}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => onChange({ ...block, visible: !block.visible })}
              className={`p-1 rounded transition-colors ${block.visible ? 'text-gray-400 hover:text-gray-600' : 'text-gray-300 hover:text-gray-500'}`}
              title={block.visible ? 'Ocultar bloco' : 'Mostrar bloco'}
            >
              {block.visible ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <button
              onClick={onRemove}
              className="p-1 rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
              title="Remover bloco"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {hasContent && (
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 mt-1"
            value={block.content ?? ''}
            onChange={(e) => onChange({ ...block, content: e.target.value })}
            placeholder="Conteúdo do bloco (use {{client_name}}, {{date}}, etc.)"
          />
        )}

        {hasTextarea && (
          <textarea
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 mt-1 resize-none"
            rows={3}
            value={block.content ?? ''}
            onChange={(e) => onChange({ ...block, content: e.target.value })}
            placeholder={
              block.type === 'scope'
                ? 'Texto padrão da descrição do projeto...'
                : 'Texto padrão das condições comerciais...'
            }
          />
        )}

        {!block.visible && (
          <p className="text-xs text-gray-400 mt-1">Bloco oculto no preview</p>
        )}
      </div>
    </div>
  )
}
