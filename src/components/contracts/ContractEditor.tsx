import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Heading2, Heading3,
} from 'lucide-react'
import { VariableTag } from './VariableTag'

interface Props {
  content: string
  onChange: (html: string) => void
  readonly?: boolean
}

function Btn({ onClick, active, children, title }: {
  onClick: () => void; active?: boolean; children: React.ReactNode; title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
    >
      {children}
    </button>
  )
}

export function ContractEditor({ content, onChange, readonly = false }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    editable: !readonly,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  // sync content when it changes externally (e.g. after generate)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content])

  if (!editor) return null

  return (
    <div className="flex flex-col gap-3">
      {!readonly && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg flex-wrap">
            <Btn title="Negrito" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><Bold size={14} /></Btn>
            <Btn title="Itálico" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><Italic size={14} /></Btn>
            <Btn title="Sublinhado" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}><UnderlineIcon size={14} /></Btn>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <Btn title="Título 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}><Heading2 size={14} /></Btn>
            <Btn title="Título 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}><Heading3 size={14} /></Btn>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <Btn title="Lista" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List size={14} /></Btn>
            <Btn title="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered size={14} /></Btn>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <Btn title="Esquerda" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}><AlignLeft size={14} /></Btn>
            <Btn title="Centro" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}><AlignCenter size={14} /></Btn>
            <Btn title="Direita" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}><AlignRight size={14} /></Btn>
          </div>

          {/* Variable inserter */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-400 mb-2 font-medium">Inserir variável</p>
            <VariableTag onInsert={(v) => editor.chain().focus().insertContent(v).run()} />
          </div>
        </>
      )}

      {/* Document area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none px-12 py-10 min-h-[600px] text-sm text-gray-800 outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[560px]"
        />
      </div>
    </div>
  )
}
