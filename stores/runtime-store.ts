import { create } from 'zustand'
import { ComponentNode } from '@/types/editor'

interface RuntimeState {
  components: Record<string, ComponentNode>
  rootId: string | null
  setPage: (components: Record<string, ComponentNode>, rootId: string) => void

  openModals: string[]
  openModal: (id: string) => void
  closeModal: (id: string) => void

  // Global context for data binding (e.g. user info, query params)
  globalContext: Record<string, unknown>
  setGlobalContext: (context: Record<string, unknown>) => void
  updateGlobalContext: (key: string, value: unknown) => void
}

export const useRuntimeStore = create<RuntimeState>((set) => ({
  components: {},
  rootId: null,
  setPage: (components, rootId) => set({ components, rootId }),

  openModals: [],
  openModal: (id) =>
    set((state) => ({
      openModals: [...state.openModals, id],
    })),
  closeModal: (id) =>
    set((state) => ({
      openModals: state.openModals.filter((modalId) => modalId !== id),
    })),

  globalContext: {},
  setGlobalContext: (context) => set({ globalContext: context }),
  updateGlobalContext: (key, value) =>
    set((state) => ({
      globalContext: { ...state.globalContext, [key]: value },
    })),
}))
