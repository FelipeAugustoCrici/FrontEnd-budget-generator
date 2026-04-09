import { Trash2 } from 'lucide-react'
import type { QuoteItem } from '../../types'
import { formatCurrency } from '../../utils/quote'

interface Props {
  item: QuoteItem
  onChange: (item: QuoteItem) => void
  onRemove: () => void
}

export function QuoteItemRow({ item, onChange, onRemove }: Props) {
  const total = item.quantity * item.unitPrice

  return (
    <tr className="border-b border-gray-100 group">
      <td className="py-2 pr-3">
        <input
          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          placeholder="Nome do item"
          value={item.name}
          onChange={(e) => onChange({ ...item, name: e.target.value })}
        />
      </td>
      <td className="py-2 pr-3 w-24">
        <input
          type="number"
          min={1}
          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          value={item.quantity}
          onChange={(e) => onChange({ ...item, quantity: Number(e.target.value) })}
        />
      </td>
      <td className="py-2 pr-3 w-36">
        <input
          type="number"
          min={0}
          step={0.01}
          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          value={item.unitPrice}
          onChange={(e) => onChange({ ...item, unitPrice: Number(e.target.value) })}
        />
      </td>
      <td className="py-2 pr-3 w-32 text-right text-sm font-medium text-gray-700">
        {formatCurrency(total)}
      </td>
      <td className="py-2 w-10">
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-red-400"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  )
}
