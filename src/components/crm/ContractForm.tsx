import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { CurrencyInput } from '../ui/CurrencyInput'
import { useClients } from '../../hooks/crm/useClients'
import { useState } from 'react'

const schema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  value: z.number().min(0),
  startDate: z.string().min(1, 'Data início obrigatória'),
  endDate: z.string().min(1, 'Data fim obrigatória'),
  description: z.string().min(1, 'Descrição obrigatória'),
  autoRenew: z.boolean().default(false),
})

type FormData = z.infer<typeof schema>

interface Props {
  initial?: Partial<FormData>
  onSubmit: (data: FormData) => void
  loading?: boolean
}

export function ContractForm({ initial, onSubmit, loading }: Props) {
  const { data: clientsData } = useClients()
  const clients = clientsData?.data ?? []
  const [value, setValue] = useState(initial?.value ?? 0)

  const { register, handleSubmit, setValue: setField, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      clientId: initial?.clientId ?? '',
      value: initial?.value ?? 0,
      startDate: initial?.startDate ?? '',
      endDate: initial?.endDate ?? '',
      description: initial?.description ?? '',
      autoRenew: initial?.autoRenew ?? false,
    },
  })

  return (
    <form onSubmit={handleSubmit((d) => onSubmit({ ...d, value }))} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Cliente</label>
        <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" {...register('clientId')}>
          <option value="">Selecione...</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>)}
        </select>
        {errors.clientId && <p className="text-xs text-red-500">{errors.clientId.message}</p>}
      </div>

      <CurrencyInput label="Valor do contrato" value={value} onChange={(v) => { setValue(v); setField('value', v) }} />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Data início" type="date" {...register('startDate')} error={errors.startDate?.message} />
        <Input label="Data fim" type="date" {...register('endDate')} error={errors.endDate?.message} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Descrição</label>
        <textarea className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 resize-none" rows={3} {...register('description')} />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" className="rounded" {...register('autoRenew')} />
        Renovação automática
      </label>

      <Button type="submit" disabled={loading} className="justify-center">
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  )
}
