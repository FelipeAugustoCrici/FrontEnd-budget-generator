import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { History, CheckCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '../../lib/api'
import type { Quote } from '../../types'

interface Props {
  quoteId: string
  onRestore: (quote: Quote) => void
}

export function QuoteVersions({ quoteId, onRestore }: Props) {
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['quotes', quoteId, 'versions'],
    queryFn: () => api.listQuoteVersions(quoteId),
    enabled: !!quoteId && open,
  })

  const activate = useMutation({
    mutationFn: (versionId: string) => api.activateQuoteVersion(quoteId, versionId),
    onSuccess: (quote) => {
      qc.invalidateQueries({ queryKey: ['quotes', quoteId, 'versions'] })
      onRestore(quote)
    },
  })

  const fmt = (d: string) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div className="mb-5 bg-white rounded-xl border border-gray-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
      >
        <History size={15} className="text-indigo-500" />
        <span className="flex-1 text-left">Histórico de versões</span>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {isLoading && (
            <p className="px-4 py-3 text-sm text-gray-400">Carregando...</p>
          )}
          {!isLoading && versions.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">Nenhuma versão encontrada.</p>
          )}
          {versions.map((v) => (
            <div key={v.id} className={`flex items-center gap-3 px-4 py-3 ${v.isActive ? 'bg-indigo-50' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">v{v.versionNumber}</span>
                  {v.isActive && (
                    <span className="flex items-center gap-1 text-xs text-indigo-600 font-medium bg-indigo-100 px-2 py-0.5 rounded-full">
                      <CheckCircle size={10} /> Ativa
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{fmt(v.createdAt)}{v.changeNote ? ` · ${v.changeNote}` : ''}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {v.snapshot.clientName || '—'} · {v.snapshot.status}
                </p>
              </div>
              {!v.isActive && (
                <button
                  onClick={() => activate.mutate(v.id)}
                  disabled={activate.isPending}
                  title="Restaurar esta versão"
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <RotateCcw size={13} /> Restaurar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
