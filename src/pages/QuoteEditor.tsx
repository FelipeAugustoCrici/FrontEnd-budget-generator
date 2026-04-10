import { useParams, Navigate } from 'react-router-dom'
import { useQuoteStore } from '../stores/quoteStore'
import { QuoteForm } from '../components/quote/QuoteForm'

export function QuoteEditor() {
  const { id } = useParams<{ id: string }>()
  const { quotes } = useQuoteStore()

  const quote = quotes.find((q) => q.id === id)
  if (!quote) return <Navigate to="/quotes" replace />
  if (quote.status === 'approved') return <Navigate to="/quotes" replace />

  return <QuoteForm initialQuote={quote} title="Editar Orçamento" />
}
