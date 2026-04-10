import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, className = '', id, error, ...props }, ref) {
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>}
        <input
          ref={ref}
          id={id}
          className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition ${error ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-400'} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
