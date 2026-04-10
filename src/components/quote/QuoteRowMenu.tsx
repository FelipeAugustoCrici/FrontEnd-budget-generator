import { useRef, useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { History, ChevronDown, CheckCircle, RotateCcw, Loader2 } from 'lucide-react'
import { api } from '../../lib/api'
import { useQuoteStore } from '../../stores/quoteStore'

interface Props {
  quoteId: string
}

export function QuoteRowMenu({ quoteId }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()
  const { fetchQuotes } = useQuoteStore()

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['quotes', quoteId, 'versions'],
    queryFn: () => api.listQuoteVersions(quoteId),
    enabled: open,
    staleTime: 0,
  })

  const activate = useMutation({
    mutationFn: (versionId: string) => api.activateQuoteVersion(quoteId, versionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes', quoteId, 'versions'] })
      fetchQuotes()
      setOpen(false)
    },
  })

  // close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const activeVersion = versions.find((v) => v.isActive)
  const fmt = (d: string) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
        title="Versões"
      >
        <History size={13} />
        {activeVersion ? `v${activeVersion.versionNumber}` : '—'}
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Versões</p>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-3 text-xs text-gray-400">
              <Loader2 size={12} className="animate-spin" /> Carregando...
            </div>
          )}

          {!isLoading && versions.length === 0 && (
            <p className="px-3 py-3 text-xs text-gray-400">Nenhuma versão encontrada.</p>
          )}

          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {versions.map((v) => (
              <div
                key={v.id}
                className={`flex items-center gap-2 px-3 py-2.5 ${v.isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-700">v{v.versionNumber}</span>
                    {v.isActive && (
                      <span className="flex items-center gap-0.5 text-[10px] text-indigo-600 font-medium bg-indigo-100 px-1.5 py-0.5 rounded-full">
                        <CheckCircle size={9} /> Ativa
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{fmt(v.createdAt)}</p>
                  {v.changeNote && <p className="text-[11px] text-gray-500 truncate">{v.changeNote}</p>}
                  <p className="text-[11px] text-gray-400 truncate">{v.snapshot.clientName || '—'} · {v.snapshot.status}</p>
                </div>
                {!v.isActive && (
                  <button
                    onClick={(e) => { e.stopPropagation(); activate.mutate(v.id) }}
                    disabled={activate.isPending}
                    className="shrink-0 flex items-center gap-1 text-[11px] text-gray-400 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <RotateCcw size={11} /> Restaurar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
