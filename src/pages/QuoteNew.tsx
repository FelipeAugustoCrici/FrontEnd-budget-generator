import { useQuoteStore, createEmptyQuote } from '../stores/quoteStore'
import { useTemplateStore } from '../stores/templateStore'
import { useSettingsStore } from '../stores/settingsStore'
import { QuoteForm } from '../components/quote/QuoteForm'

export function QuoteNew() {
  const { selectedTemplateId } = useTemplateStore()
  const { company } = useSettingsStore()
  const { currentQuote, quotes } = useQuoteStore()

  // If currentQuote exists and is NOT saved yet, use it (AI-generated or pre-filled)
  const isUnsaved = currentQuote && !quotes.find((q) => q.id === currentQuote.id)

  const quote = isUnsaved
    ? currentQuote
    : {
        ...createEmptyQuote(selectedTemplateId),
        companyName: company.name,
        companyLogo: company.logo,
      }

  return <QuoteForm initialQuote={quote} title="Novo Orçamento" />
}
