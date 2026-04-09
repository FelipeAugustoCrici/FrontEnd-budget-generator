import { useTemplateStore } from '../stores/templateStore'
import { useSettingsStore } from '../stores/settingsStore'
import { createEmptyQuote } from '../stores/quoteStore'
import { QuoteForm } from '../components/quote/QuoteForm'

export function QuoteNew() {
  const { selectedTemplateId } = useTemplateStore()
  const { company } = useSettingsStore()

  const quote = {
    ...createEmptyQuote(selectedTemplateId),
    companyName: company.name,
    companyLogo: company.logo,
  }

  return <QuoteForm initialQuote={quote} title="Novo Orçamento" />
}
