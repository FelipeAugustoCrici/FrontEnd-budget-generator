import { VARIABLE_LABELS } from '../../utils/contractTemplate'
import type { ContractVariables } from '../../utils/contractTemplate'

interface Props {
  onInsert: (variable: string) => void
}

export function VariableTag({ onInsert }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(VARIABLE_LABELS) as (keyof ContractVariables)[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onInsert(`{{${key}}}`)}
          className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-mono hover:bg-indigo-100 transition-colors border border-indigo-100"
          title={VARIABLE_LABELS[key]}
        >
          {`{{${key}}}`}
        </button>
      ))}
    </div>
  )
}
