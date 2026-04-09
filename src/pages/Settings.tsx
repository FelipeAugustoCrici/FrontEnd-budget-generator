import { useEffect, useState } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { LogoUpload } from '../components/ui/LogoUpload'
import { Globe, Building2, Type, Save, Check } from 'lucide-react'
import { injectFont, applyFontToBody } from '../utils/font'

// Popular Google Fonts presets
const FONT_PRESETS = [
  { label: 'Padrão do sistema', value: '', url: '' },
  { label: 'Inter', value: 'Inter', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' },
  { label: 'Roboto', value: 'Roboto', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap' },
  { label: 'Poppins', value: 'Poppins', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap' },
  { label: 'Lato', value: 'Lato', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap' },
  { label: 'Montserrat', value: 'Montserrat', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap' },
  { label: 'Playfair Display', value: 'Playfair Display', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap' },
  { label: 'Personalizada (URL)', value: 'custom', url: '' },
]

export function Settings() {
  const { company, update, fetchSettings, save } = useSettingsStore()
  const [saved, setSaved] = useState(false)

  useEffect(() => { fetchSettings() }, [])

  async function handleSave() {
    await save()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // Inject font when it changes
  useEffect(() => {
    injectFont(company.fontUrl, company.fontFamily)
    applyFontToBody(company.fontFamily)
  }, [company.fontUrl, company.fontFamily])

  const isCustomFont = company.fontFamily === 'custom' ||
    (company.fontFamily && !FONT_PRESETS.find(f => f.value === company.fontFamily && f.value !== 'custom'))

  function handleFontPreset(value: string) {
    const preset = FONT_PRESETS.find(f => f.value === value)
    if (!preset) return
    if (value === 'custom') {
      update({ fontFamily: 'custom', fontUrl: '' })
    } else {
      update({ fontFamily: value, fontUrl: preset.url })
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500 mt-1">Dados da empresa usados nos orçamentos</p>
        </div>
        <Button onClick={handleSave} variant={saved ? 'secondary' : 'primary'}>
          {saved ? <><Check size={16} /> Salvo</> : <><Save size={16} /> Salvar</>}
        </Button>
      </div>

      <Card className="p-6 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <Building2 size={16} className="text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-700">Dados da Empresa</h2>
        </div>
        <div className="flex flex-col gap-4">
          <Input
            label="Nome da empresa"
            value={company.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Ex: Trinity Web"
          />
          <LogoUpload
            value={company.logo}
            onChange={(base64) => update({ logo: base64 })}
          />
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-700">Exibir nome no cabeçalho</p>
              <p className="text-xs text-gray-400 mt-0.5">Desative se sua logo já contém o nome da empresa</p>
            </div>
            <button
              type="button"
              onClick={() => update({ showNameOnHeader: !company.showNameOnHeader })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                company.showNameOnHeader ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  company.showNameOnHeader ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="E-mail"
              type="email"
              value={company.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="contato@empresa.com"
            />
            <Input
              label="Telefone"
              value={company.phone}
              onChange={(e) => update({ phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <Type size={16} className="text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-700">Tipografia</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Fonte dos orçamentos</label>
            <select
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 transition"
              value={isCustomFont ? 'custom' : (company.fontFamily || '')}
              onChange={(e) => handleFontPreset(e.target.value)}
            >
              {FONT_PRESETS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {(isCustomFont || company.fontFamily === 'custom') && (
            <>
              <Input
                label="Nome da fonte"
                value={isCustomFont && company.fontFamily !== 'custom' ? company.fontFamily : ''}
                onChange={(e) => update({ fontFamily: e.target.value })}
                placeholder="Ex: MyFont"
              />
              <Input
                label="URL do CSS da fonte (Google Fonts ou outro)"
                value={company.fontUrl}
                onChange={(e) => update({ fontUrl: e.target.value })}
                placeholder="https://fonts.googleapis.com/css2?family=..."
              />
            </>
          )}

          {company.fontFamily && company.fontFamily !== 'custom' && (
            <p
              className="text-base text-gray-600 px-3 py-2 bg-gray-50 rounded-lg"
              style={{ fontFamily: company.fontFamily }}
            >
              Prévia: O rato roeu a roupa do rei de Roma.
            </p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe size={16} className="text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-700">Redes Sociais</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Instagram</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
              <input
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                value={company.instagram}
                onChange={(e) => update({ instagram: e.target.value })}
                placeholder="suaempresa"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Facebook</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/</span>
              <input
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                value={company.facebook}
                onChange={(e) => update({ facebook: e.target.value })}
                placeholder="suaempresa"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Website</label>
            <div className="relative">
              <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                value={company.website}
                onChange={(e) => update({ website: e.target.value })}
                placeholder="suaempresa.com.br"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
