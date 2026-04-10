import type { Client, Contract } from '../../types/crm'

export const mockClients: Client[] = [
  { id: '1', name: 'Felipe Augusto', company: 'Trinity Web', email: 'felipe@trinity.com', phone: '(11) 99999-0001', notes: 'Cliente VIP', status: 'active', createdAt: '2026-01-10T00:00:00Z' },
  { id: '2', name: 'Ana Lima', company: 'Tiken', email: 'ana@tiken.com', phone: '(11) 99999-0002', notes: '', status: 'active', createdAt: '2026-02-05T00:00:00Z' },
  { id: '3', name: 'Carlos Souza', company: 'LinPost', email: 'carlos@linpost.com', phone: '(11) 99999-0003', notes: 'Aguardando retorno', status: 'inactive', createdAt: '2026-03-01T00:00:00Z' },
]

export const mockContracts: Contract[] = [
  {
    id: '1', clientId: '1', clientName: 'Trinity Web', value: 3600, status: 'signed',
    startDate: '2026-01-15', endDate: '2026-07-15', description: 'Desenvolvimento de sistema de orçamentos', autoRenew: false,
    events: [
      { id: 'e1', type: 'sent', date: '2026-01-10T10:00:00Z' },
      { id: 'e2', type: 'viewed', date: '2026-01-11T14:00:00Z' },
      { id: 'e3', type: 'signed', date: '2026-01-12T09:00:00Z' },
    ],
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: '2', clientId: '2', clientName: 'Tiken', value: 1800, status: 'sent',
    startDate: '2026-04-01', endDate: '2026-10-01', description: 'Landing page e manutenção mensal', autoRenew: true,
    events: [
      { id: 'e4', type: 'sent', date: '2026-03-28T10:00:00Z' },
    ],
    createdAt: '2026-03-28T00:00:00Z',
  },
  {
    id: '3', clientId: '3', clientName: 'LinPost', value: 900, status: 'draft',
    startDate: '2026-05-01', endDate: '2026-08-01', description: 'Extensão Chrome', autoRenew: false,
    events: [],
    createdAt: '2026-04-01T00:00:00Z',
  },
]
