import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, Save, Eye, Lock } from 'lucide-react'
import { useContract, useContractAction, useUpdateContract } from '../../hooks/crm/useContracts'
import { useContractDocStore } from '../../stores/contractDocStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { ContractEditor } from '../../components/contracts/ContractEditor'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/crm/StatusBadge'
import {
  DEFAULT_CONTRACT_TEMPLATE,
  replaceTemplateVariables,
  formatCurrency,
  formatDate,
} from '../../utils/contractTemplate'

export function ContractEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contract, isLoading } = useContract(id!)
  const { setDoc, getDoc } = useContractDocStore()
  const { company } = useSettingsStore()
  const updateContract = useUpdateContract()
  const action = useContractAction()

  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const isLocked = contract?.status === 'signed'
  const existingDoc = id ? getDoc(id) : undefined

  useEffect(() => {
    if (!contract) return
    if (existingDoc?.content) {
      setContent(existingDoc.content)
    }
  }, [contract])

  function handleContentChange(html: string) {
    setContent(html)
    setIsDirty(true)
  }

  function handleGenerate() {
    if (!contract) return
    const vars = {
      client_name: contract.client?.name ?? '',
      client_company: contract.client?.company ?? '',
      client_email: contract.client?.email ?? '',
      contract_value: formatCurrency(contract.value),
      start_date: formatDate(contract.start_date),
      end_date: formatDate(contract.end_date),
      service_description: contract.description,
      current_date: new Date().toLocaleDateString('pt-BR'),
      company_name: company.name || 'Sua Empresa',
    }
    setContent(replaceTemplateVariables(DEFAULT_CONTRACT_TEMPLATE, vars))
    setIsDirty(true)
  }

  function handleSave() {
    if (!id) return
    setDoc(id, content)
    setSaved(true)
    setIsDirty(false)
    setTimeout(() => setSaved(false), 2000)
  }

  if (isLoading) return <div className="text-center py-20 text-gray-400">Carregando...</div>
  if (!contract) return <div className="text-center py-20 text-gray-400">Contrato não encontrado.</div>

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/crm/contracts/${id}`)}>
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Documento do Contrato</h1>
          <p className="text-sm text-gray-500">{contract.client?.name} · {contract.description?.slice(0, 50)}</p>
        </div>
        <StatusBadge type="contract" status={contract.status as any} />

        {!isLocked && (
          <>
            {!content && (
              <Button onClick={handleGenerate}>
                <Sparkles size={15} /> Gerar contrato
              </Button>
            )}
            {content && (
              <>
                <Button variant="secondary" onClick={handleGenerate} title="Regenerar a partir do template">
                  <Sparkles size={15} /> Regenerar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/crm/contracts/${id}/document/view`)}
                  disabled={isDirty}
                  title={isDirty ? 'Salve o documento antes de visualizar' : undefined}
                >
                  <Eye size={15} /> Visualizar
                </Button>
                <Button onClick={handleSave} disabled={updateContract.isPending}>
                  <Save size={15} /> {saved ? 'Salvo!' : 'Salvar'}
                </Button>
              </>
            )}
          </>
        )}

        {isLocked && (
          <Button variant="secondary" onClick={() => navigate(`/crm/contracts/${id}/document/view`)}>
            <Eye size={15} /> Visualizar
          </Button>
        )}
      </div>

      {isLocked && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 text-amber-700 text-sm rounded-lg">
          <Lock size={14} /> Contrato assinado — não pode ser editado.
        </div>
      )}

      {!content && !isLocked && (
        <Card className="p-16 text-center">
          <Sparkles size={32} className="text-indigo-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Nenhum documento gerado ainda.</p>
          <p className="text-sm text-gray-400 mb-6">Clique em "Gerar contrato" para preencher automaticamente com os dados do contrato.</p>
          <Button onClick={handleGenerate}><Sparkles size={15} /> Gerar contrato</Button>
        </Card>
      )}

      {content && (
        <ContractEditor
          content={content}
          onChange={handleContentChange}
          readonly={isLocked}
        />
      )}
    </div>
  )
}
