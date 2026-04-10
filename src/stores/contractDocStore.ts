import { create } from 'zustand'

export interface ContractDoc {
  contractId: string
  content: string   // HTML final editado
  savedAt?: string
}

interface ContractDocStore {
  docs: Record<string, ContractDoc>
  setDoc: (contractId: string, content: string) => void
  getDoc: (contractId: string) => ContractDoc | undefined
  clearDoc: (contractId: string) => void
}

export const useContractDocStore = create<ContractDocStore>((set, get) => ({
  docs: {},

  setDoc: (contractId, content) =>
    set((s) => ({
      docs: {
        ...s.docs,
        [contractId]: { contractId, content, savedAt: new Date().toISOString() },
      },
    })),

  getDoc: (contractId) => get().docs[contractId],

  clearDoc: (contractId) =>
    set((s) => {
      const docs = { ...s.docs }
      delete docs[contractId]
      return { docs }
    }),
}))
