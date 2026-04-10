export type ClientStatus = 'active' | 'inactive'

export interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  notes: string
  status: ClientStatus
  createdAt: string
}

export type ContractStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'refused' | 'expired'

export interface ContractEvent {
  id: string
  type: ContractStatus
  date: string
  note?: string
}

export interface Contract {
  id: string
  clientId: string
  clientName: string
  quoteId?: string
  value: number
  status: ContractStatus
  startDate: string
  endDate: string
  description: string
  autoRenew: boolean
  events: ContractEvent[]
  createdAt: string
}
