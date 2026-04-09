import { useState, useEffect } from 'react'

interface Props {
  label?: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
}

function formatDisplay(value: number): string {
  if (!value && value !== 0) return ''
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseInput(raw: string): number {
  // remove tudo exceto dígitos
  const digits = raw.replace(/\D/g, '')
  if (!digits) return 0
  // últimos 2 dígitos são centavos
  const cents = parseInt(digits, 10)
  return cents / 100
}

export function CurrencyInput({ label, value, onChange, placeholder = '0,00' }: Props) {
  const [display, setDisplay] = useState(formatDisplay(value))

  useEffect(() => {
    setDisplay(formatDisplay(value))
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const parsed = parseInput(e.target.value)
    setDisplay(formatDisplay(parsed))
    onChange(isNaN(parsed) ? 0 : parsed)
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">R$</span>
        <input
          type="text"
          inputMode="numeric"
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          value={display}
          onChange={handleChange}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
