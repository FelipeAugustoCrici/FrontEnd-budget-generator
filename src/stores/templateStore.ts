import { create } from 'zustand'
import { api } from '../lib/api'
import type { Template, TemplateBlock } from '../types'

const defaultTemplate: Template = {
  id: 'default',
  name: 'Profissional',
  isDefault: true,
  createdAt: new Date().toISOString(),
  blocks: [
    { id: '1', type: 'header', content: 'Orçamento – {{client_name}}', align: 'center', visible: true },
    { id: '2', type: 'scope', content: 'Descreva aqui o escopo do projeto e as atividades que serão realizadas.', visible: true },
    { id: '3', type: 'items_table', visible: true },
    { id: '4', type: 'financial_summary', visible: true },
    { id: '5', type: 'conditions', content: 'O valor acima considera o escopo descrito neste documento. Caso haja necessidade de ajustes adicionais ou novas demandas, estes poderão ser orçados separadamente mediante alinhamento prévio.', visible: true },
    { id: '6', type: 'footer', visible: true },
  ],
}

interface TemplateStore {
  templates: Template[]
  selectedTemplateId: string
  loading: boolean
  setSelectedTemplate: (id: string) => void
  fetchTemplates: () => Promise<void>
  saveTemplate: (template: Template) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  duplicateTemplate: (id: string) => Promise<void>
  updateBlock: (templateId: string, block: TemplateBlock) => void
  reorderBlocks: (templateId: string, blocks: TemplateBlock[]) => void
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [defaultTemplate],
  selectedTemplateId: 'default',
  loading: false,

  setSelectedTemplate: (id) => set({ selectedTemplateId: id }),

  fetchTemplates: async () => {
    set({ loading: true })
    try {
      const remote = await api.listTemplates()
      // merge with default template (always available locally)
      const hasDefault = remote.some((t: Template) => t.id === 'default')
      set({ templates: hasDefault ? remote : [defaultTemplate, ...remote] })
    } catch {
      // keep local default if API fails
    } finally {
      set({ loading: false })
    }
  },

  saveTemplate: async (template) => {
    if (template.id === 'default') {
      // default template is local only
      set((state) => ({
        templates: state.templates.map((t) => (t.id === 'default' ? template : t)),
      }))
      return
    }
    const exists = get().templates.find((t) => t.id === template.id && t.id !== 'default')
    const saved = exists
      ? await api.updateTemplate(template.id, template)
      : await api.createTemplate(template)
    set((state) => ({
      templates: exists
        ? state.templates.map((t) => (t.id === saved.id ? saved : t))
        : [...state.templates, saved],
    }))
  },

  deleteTemplate: async (id) => {
    if (id !== 'default') await api.deleteTemplate(id)
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
      selectedTemplateId: state.selectedTemplateId === id ? 'default' : state.selectedTemplateId,
    }))
  },

  duplicateTemplate: async (id) => {
    const template = get().templates.find((t) => t.id === id)
    if (!template) return
    const copy: Template = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (cópia)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      blocks: template.blocks.map((b) => ({ ...b, id: crypto.randomUUID() })),
    }
    const saved = await api.createTemplate(copy)
    set((state) => ({ templates: [...state.templates, saved] }))
  },

  updateBlock: (templateId, block) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId
          ? { ...t, blocks: t.blocks.map((b) => (b.id === block.id ? block : b)) }
          : t
      ),
    })),

  reorderBlocks: (templateId, blocks) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId ? { ...t, blocks } : t
      ),
    })),
}))
