import type { ContractEvent } from '../../types/crm'
import { StatusBadge } from './StatusBadge'

interface Props { events: ContractEvent[] }

export function Timeline({ events }: Props) {
  if (events.length === 0) {
    return <p className="text-sm text-gray-400 py-4">Nenhum evento registrado.</p>
  }

  return (
    <div className="flex flex-col gap-0">
      {events.map((event, i) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1 shrink-0" />
            {i < events.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
          </div>
          <div className="pb-5">
            <div className="flex items-center gap-2 mb-0.5">
              <StatusBadge type="contract" status={event.type} />
              <span className="text-xs text-gray-400">
                {new Date(event.date).toLocaleString('pt-BR')}
              </span>
            </div>
            {event.note && <p className="text-sm text-gray-600">{event.note}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
