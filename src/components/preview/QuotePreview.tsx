import { forwardRef } from 'react'
import type { Quote, Template } from '../../types'
import { resolveVariables } from '../../utils/template'
import { formatCurrency, formatDate } from '../../utils/quote'
import { useSettingsStore } from '../../stores/settingsStore'

interface Props {
  quote: Quote
  template: Template
}

// SVG logo placeholder (triangle/W shape similar to the reference)
function CompanyLogo() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="28,4 52,48 4,48" fill="none" stroke="#111" strokeWidth="3" />
      <polyline points="14,48 28,24 42,48" fill="none" stroke="#111" strokeWidth="3" />
      <line x1="22" y1="48" x2="34" y2="48" stroke="#111" strokeWidth="3" />
    </svg>
  )
}

export const QuotePreview = forwardRef<HTMLDivElement, Props>(function QuotePreview({ quote, template }, ref) {
  const visibleBlocks = template.blocks.filter((b) => b.visible)
  const { company } = useSettingsStore()

  const companyName = quote.companyName || company.name
  const companyLogo = quote.companyLogo || company.logo
  const showName = company.showNameOnHeader ?? true
  const fontStyle = company.fontFamily
    ? { fontFamily: company.fontFamily }
    : {}

  // Calculate totals for financial summary
  const totalHours = quote.items.reduce((sum, i) => sum + (i.estimateHours ?? i.quantity), 0)
  const hourlyRate = Number(quote.hourlyRate ?? 0)
  const grandTotal = hourlyRate > 0
    ? totalHours * hourlyRate
    : quote.items.reduce((s, i) => s + (i.estimateHours ?? i.quantity) * Number(i.unitPrice ?? 0), 0)

  return (
    <div
      ref={ref}
      id="print-area"
      style={fontStyle}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 max-w-2xl mx-auto font-sans text-gray-800 overflow-hidden"
    >      {/* Page content with padding */}
      <div className="px-12 pt-10 pb-6">
        {visibleBlocks.map((block) => {
          switch (block.type) {

            // ── HEADER ──────────────────────────────────────────────
            case 'header':
              return (
                <div key={block.id} className="flex flex-col items-center mb-6">
                  {/* Company logo area */}
                  <div className="mb-1 flex flex-col items-center gap-1">
                    {showName && (
                      <span className="text-[10px] font-bold tracking-[0.25em] text-gray-800 uppercase">
                        {companyName || 'Sua Empresa'}
                      </span>
                    )}
                    {companyLogo
                      ? <img src={companyLogo} alt="logo" className="h-14 object-contain" />
                      : <CompanyLogo />
                    }
                  </div>
                  {/* Divider */}
                  <div className="w-10 border-t-2 border-gray-800 my-4" />
                  {/* Quote title */}
                  <h1 className="text-lg font-bold text-gray-900 text-center">
                    {resolveVariables(block.content ?? 'Orçamento – {{client_name}}', quote)}
                  </h1>
                </div>
              )

            // ── SCOPE ────────────────────────────────────────────────
            case 'scope':
              return (quote.scope || block.content) ? (
                <div
                  key={block.id}
                  className="mb-6 text-sm text-gray-700 leading-relaxed [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2"
                  dangerouslySetInnerHTML={{ __html: quote.scope || block.content || '' }}
                />
              ) : null

            // ── CLIENT INFO ──────────────────────────────────────────
            case 'client_info':
              return (
                <div key={block.id} className="mb-6 text-sm">
                  <span className="font-semibold">Cliente:</span> {quote.clientName || '—'}
                  <span className="ml-6 font-semibold">Data:</span> {formatDate(quote.date)}
                </div>
              )

            // ── ITEMS TABLE ──────────────────────────────────────────
            case 'items_table':
              return (
                <div key={block.id} className="mb-6">
                  <table className="w-full text-sm border border-gray-300 border-collapse">
                    <thead>
                      <tr style={{ backgroundColor: '#111827', color: '#ffffff' }}>
                        <th className="text-center py-2 px-4 font-semibold border border-gray-700">Atividades</th>
                        <th className="text-center py-2 px-4 font-semibold border border-gray-700 w-28">Estimativas</th>
                        <th className="text-center py-2 px-4 font-semibold border border-gray-700 w-36">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.items.map((item, idx) => (
                        <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                          <td className="py-2 px-4 border border-gray-200 text-gray-700">{item.name || '—'}</td>
                          <td className="py-2 px-4 border border-gray-200 text-center text-gray-600">
                            {item.estimateHours != null ? `${item.estimateHours}h` : `${item.quantity}`}
                          </td>
                          <td className="py-2 px-4 border border-gray-200 text-center text-gray-600">
                            {item.itemStatus || 'Aguard. Aprovação'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )

            // ── FINANCIAL SUMMARY ────────────────────────────────────
            case 'financial_summary':
              return (
                <div key={block.id} className="mb-6">
                  <h2 className="text-sm font-bold text-gray-900 mb-2">Resumo financeiro</h2>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>
                      <span className="font-bold">Estimativa total:</span>{' '}
                      {totalHours} hora{totalHours !== 1 ? 's' : ''}
                    </li>
                    {hourlyRate > 0 && (
                      <li>
                        <span className="font-bold">Valor por hora:</span>{' '}
                        {formatCurrency(hourlyRate)}
                      </li>
                    )}
                    <li>
                      <span className="font-bold">Valor total estimado:</span>{' '}
                      {formatCurrency(grandTotal)}
                    </li>
                  </ul>
                </div>
              )

            // ── TOTALS (fallback) ────────────────────────────────────
            case 'totals':
              return (
                <div key={block.id} className="mb-6 flex flex-col items-end gap-1 text-sm">
                  <div className="flex gap-8 font-bold text-base text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              )

            // ── CONDITIONS ───────────────────────────────────────────
            case 'conditions':
              return (
                <div key={block.id} className="mb-6">
                  <h2 className="text-sm font-bold text-gray-900 mb-2">Condições</h2>
                  <div
                    className="text-sm text-gray-700 leading-relaxed [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2"
                    dangerouslySetInnerHTML={{ __html: quote.conditions || block.content || 'O valor acima considera o escopo descrito neste documento.' }}
                  />
                </div>
              )

            // ── NOTES ────────────────────────────────────────────────
            case 'notes':
              return quote.notes ? (
                <div key={block.id} className="mb-6">
                  <h2 className="text-sm font-bold text-gray-900 mb-2">Observações</h2>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
                </div>
              ) : null

            // ── SIGNATURE ────────────────────────────────────────────
            case 'signature':
              return (
                <div key={block.id} className="mt-10 pt-6 border-t border-gray-200 flex justify-between text-xs text-gray-400">
                  <div className="text-center">
                    <div className="w-36 border-b border-gray-300 mb-1" />
                    <span>Assinatura do Cliente</span>
                  </div>
                  <div className="text-center">
                    <div className="w-36 border-b border-gray-300 mb-1" />
                    <span>Assinatura do Responsável</span>
                  </div>
                </div>
              )

            // ── FOOTER ───────────────────────────────────────────────
            case 'footer':
              return null // rendered outside padding below

            default:
              return null
          }
        })}
      </div>

      {/* Footer bar — outside main padding */}
      {visibleBlocks.some((b) => b.type === 'footer') && (
        <div className="border-t border-gray-200 px-12 py-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            <span>{company.instagram || `@${companyName?.replace(/\s/g, '') || 'suaempresa'}`}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            <span>{company.facebook || `/${companyName?.replace(/\s/g, '') || 'suaempresa'}`}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span>{company.website || `${companyName?.replace(/\s/g, '') || 'suaempresa'}.com.br`}</span>
          </div>
        </div>
      )}
    </div>
  )
})
