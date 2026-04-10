import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { Client } from '../../types/crm'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  company: z.string().min(1, 'Empresa obrigatória'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(1, 'Telefone obrigatório'),
  notes: z.string().default(''),
  status: z.enum(['active', 'inactive']).default('active'),
})

type FormData = z.infer<typeof schema>

interface Props {
  initial?: Partial<Client>
  onSubmit: (data: FormData) => void
  loading?: boolean
}

export function ClientForm({ initial, onSubmit, loading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: initial?.name ?? '', company: initial?.company ?? '', email: initial?.email ?? '', phone: initial?.phone ?? '', notes: initial?.notes ?? '', status: initial?.status ?? 'active' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Nome" {...register('name')} error={errors.name?.message} />
      <Input label="Empresa" {...register('company')} error={errors.company?.message} />
      <Input label="E-mail" type="email" {...register('email')} error={errors.email?.message} />
      <Input label="Telefone" {...register('phone')} error={errors.phone?.message} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" {...register('status')}>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Observações</label>
        <textarea className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 resize-none" rows={3} {...register('notes')} />
      </div>
      <Button type="submit" disabled={loading} className="justify-center">
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  )
}
