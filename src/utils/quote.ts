import type { Quote } from '../types'

export function calcSubtotal(quote: Quote): number {
  return quote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

export function calcDiscount(quote: Quote): number {
  const sub = calcSubtotal(quote)
  if (quote.discountType === 'percent') return (sub * quote.discount) / 100
  return Math.min(quote.discount, sub)
}

export function calcTotal(quote: Quote): number {
  return calcSubtotal(quote) - calcDiscount(quote)
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export const STATUS_LABELS: Record<Quote['status'], string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
}

export const STATUS_COLORS: Record<Quote['status'], string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-600',
  approved: 'bg-green-100 text-green-600',
  rejected: 'bg-red-100 text-red-600',
}
