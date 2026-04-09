import { useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { api } from '../../lib/api'

interface Props {
  value: string
  onChange: (url: string) => void
}

export function LogoUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const url = await api.uploadFile(file)
      onChange(url)
    } catch (err: any) {
      setError('Erro ao enviar imagem')
      console.error(err)
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleClear() {
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">Logo da empresa</label>

      {value ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
          <img src={value} alt="logo" className="h-10 object-contain rounded" />
          <span className="text-xs text-gray-500 flex-1">Logo carregado</span>
          <button
            onClick={handleClear}
            className="p-1 rounded hover:bg-red-50 text-red-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors disabled:opacity-50"
        >
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Enviando...</>
            : <><Upload size={15} /> Clique para enviar imagem</>
          }
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
