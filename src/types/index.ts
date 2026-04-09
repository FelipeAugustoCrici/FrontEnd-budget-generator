export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected'

export interface QuoteItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  // extended fields for the professional template
  estimateHours?: number
  itemStatus?: string
}

export interface Quote {
  id: string
  clientName: string
  date: string
  notes: string
  status: QuoteStatus
  items: QuoteItem[]
  discount: number
  discountType: 'percent' | 'value'
  templateId: string
  createdAt: string
  // extended fields
  scope?: string
  conditions?: string
  hourlyRate?: number
  companyName?: string
  companyLogo?: string
}

export type BlockType =
  | 'header'
  | 'client_info'
  | 'items_table'
  | 'totals'
  | 'notes'
  | 'signature'
  | 'scope'
  | 'financial_summary'
  | 'conditions'
  | 'footer'

export interface TemplateBlock {
  id: string
  type: BlockType
  content?: string
  align?: 'left' | 'center' | 'right'
  visible: boolean
}

export interface Template {
  id: string
  name: string
  isDefault: boolean
  blocks: TemplateBlock[]
  createdAt: string
}
