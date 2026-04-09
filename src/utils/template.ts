import type { Quote } from '../types'
import { formatCurrency, formatDate, calcSubtotal, calcDiscount, calcTotal } from './quote'

export function resolveVariables(content: string, quote: Quote): string {
  return content
    .replace(/{{client_name}}/g, quote.clientName || '[Cliente]')
    .replace(/{{date}}/g, formatDate(quote.date))
    .replace(/{{subtotal}}/g, formatCurrency(calcSubtotal(quote)))
    .replace(/{{discount}}/g, formatCurrency(calcDiscount(quote)))
    .replace(/{{total}}/g, formatCurrency(calcTotal(quote)))
    .replace(/{{notes}}/g, quote.notes || '')
    .replace(/{{scope}}/g, quote.scope || '')
    .replace(/{{conditions}}/g, quote.conditions || '')
    .replace(/{{company_name}}/g, quote.companyName || '')
}

export const BLOCK_LABELS: Record<string, string> = {
  header: 'Cabeçalho',
  client_info: 'Dados do Cliente',
  items_table: 'Tabela de Atividades',
  totals: 'Totais',
  notes: 'Observações',
  signature: 'Assinatura',
  scope: 'Escopo / Descrição',
  financial_summary: 'Resumo Financeiro',
  conditions: 'Condições',
  footer: 'Rodapé',
}
