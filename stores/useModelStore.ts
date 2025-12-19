import { create } from 'zustand'
import { DataModel, Field, FieldType, ValidationRules, RelationConfig } from '@/types/data-engine'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ModelStore {
  models: DataModel[]
  currentModel: DataModel | null
  originalModel: DataModel | null // For dirty check
  loading: boolean
  isDirty: boolean // Derived state
  fetchModels: () => Promise<void>
  fetchModel: (id: string) => Promise<void>
  createModel: (name: string, tableName: string, description?: string) => Promise<boolean>
  deleteModel: (id: string) => Promise<boolean>
  publishModel: () => Promise<boolean>
  previewModel: () => Promise<{ ops: string[]; destructive: boolean } | null>
  // Field Operations (Local Draft)
  addField: (field: Field) => void
  updateField: (field: Field) => void
  deleteField: (fieldId: string) => void
}

export const useModelStore = create<ModelStore>((set, get) => ({
  models: [],
  loading: false,
  currentModel: null,
  originalModel: null,
  isDirty: false,

  fetchModels: async () => {
    set({ loading: true })
    try {
      const supabase = createClient()

      const [modelsResult, fieldsResult] = await Promise.all([
        supabase.from('_sys_models').select('*').order('created_at', { ascending: false }),
        supabase.from('_sys_fields').select('*'),
      ])

      if (modelsResult.error) throw modelsResult.error
      if (fieldsResult.error) throw fieldsResult.error

      const allFields = fieldsResult.data || []
      const fieldsByModel = (allFields || []).reduce(
        (acc: Record<string, unknown[]>, field: unknown) => {
          const f = field as Record<string, unknown>
          const modelId = f.model_id as string
          if (!acc[modelId]) acc[modelId] = []
          acc[modelId].push(f)
          return acc
        },
        {}
      )

      const models: DataModel[] = (modelsResult.data || []).map((row) => ({
        id: row.id,
        name: row.name,
        table_name: row.table_name,
        description: row.description,
        fields: ((fieldsByModel[row.id] as unknown[]) || []).map((f: unknown) => {
          const field = f as Record<string, unknown>
          const config = field.config as Record<string, unknown> | undefined
          return {
            id: field.id as string,
            name: field.name as string,
            key: field.key as string,
            type: field.type as FieldType,
            description: field.description as string,
            defaultValue: config?.defaultValue,
            options: config?.options as string[] | undefined,
            validation: config?.validation as ValidationRules | undefined,
            relation: config?.relation as RelationConfig | undefined,
            isSystem: field.is_system as boolean,
          }
        }),
        created_at: row.created_at,
        updated_at: row.updated_at,
      }))

      set({ models })
    } catch (error: unknown) {
      const err = error as Error
      console.error('Error fetching models:', err)
      toast.error(err.message || 'Failed to load models')
    } finally {
      set({ loading: false })
    }
  },

  fetchModel: async (id: string) => {
    set({ loading: true })
    try {
      const supabase = createClient()

      // Fetch model metadata
      const { data: modelData, error: modelError } = await supabase
        .from('_sys_models')
        .select('*')
        .eq('id', id)
        .single()

      if (modelError) throw modelError

      // Fetch fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('_sys_fields')
        .select('*')
        .eq('model_id', id)
        .order('created_at', { ascending: true })

      if (fieldsError) throw fieldsError

      const fullModel: DataModel = {
        id: modelData.id,
        name: modelData.name,
        table_name: modelData.table_name,
        description: modelData.description,
        created_at: modelData.created_at,
        updated_at: modelData.updated_at,
        fields: (fieldsData || []).map((f) => ({
          id: f.id,
          name: f.name,
          key: f.key,
          type: f.type,
          description: f.description,
          defaultValue: f.config?.defaultValue,
          options: f.config?.options,
          validation: f.config?.validation,
          relation: f.config?.relation,
          isSystem: f.is_system,
        })),
      }

      set({
        currentModel: fullModel,
        originalModel: JSON.parse(JSON.stringify(fullModel)),
        isDirty: false,
      })
    } catch {
      // console.error('Error fetching model details:', error);
      set({ currentModel: null, originalModel: null, isDirty: false })
    } finally {
      set({ loading: false })
    }
  },

  createModel: async (name: string, tableName: string, description?: string) => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('_sys_models')
        .insert({
          name,
          table_name: tableName,
          description,
        })
        .select()
        .single()

      if (error) throw error

      const newModel: DataModel = {
        id: data.id,
        name: data.name,
        table_name: data.table_name,
        description: data.description,
        fields: [],
        created_at: data.created_at,
        updated_at: data.updated_at,
      }

      set((state) => ({ models: [newModel, ...state.models] }))
      toast.success('Model created successfully')
      return true
    } catch (error: unknown) {
      const err = error as Error
      console.error('Error', err)
      toast.error(err.message || 'Failed')
      return false
    }
  },

  deleteModel: async (id: string) => {
    try {
      const response = await fetch(`/api/models/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete model')
      }

      // Remove from local state
      set((state) => ({
        models: state.models.filter((m) => m.id !== id),
        currentModel: state.currentModel?.id === id ? null : state.currentModel,
        originalModel: state.originalModel?.id === id ? null : state.originalModel,
      }))

      toast.success('Model deleted successfully')
      return true
    } catch (error: unknown) {
      const err = error as Error
      console.error('Error', err)
      toast.error(err.message || 'Failed')
      return false
    }
  },

  publishModel: async () => {
    const state = get()
    if (!state.currentModel) return false

    set({ loading: true })
    try {
      // 1. Dry Run / Check Phase
      const checkResponse = await fetch(`/api/models/${state.currentModel.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: state.currentModel, dryRun: true }),
      })

      if (!checkResponse.ok) throw new Error('Failed to check model changes')

      const checkResult = await checkResponse.json()

      if (checkResult.destructive) {
        // For MVP, using standard confirm. ideally UI dialog.

        if (
          !confirm(
            `WARNING: This update will DELETE DATA (Drop Columns). \n\nOperations:\n${checkResult.ops.join('\n')}\n\nContinue?`
          )
        ) {
          set({ loading: false })
          return false
        }
      } else if (checkResult.ops.length === 0) {
        toast.info('No changes to publish.')
        set({ loading: false })
        return true
      }

      // 2. Real Publish
      const response = await fetch(`/api/models/${state.currentModel.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: state.currentModel, dryRun: false }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to publish model')
      }

      toast.success('Model published successfully!')

      // Sync originalModel
      const updatedModel = { ...state.currentModel }
      set({ originalModel: JSON.parse(JSON.stringify(updatedModel)), isDirty: false })

      return true
    } catch (error: unknown) {
      const err = error as Error
      console.error('Error', err)
      toast.error(err.message || 'Failed')
      return false
    } finally {
      set({ loading: false })
    }
  },

  addField: (field: Field) => {
    set((state) => {
      if (!state.currentModel) return state
      const newFields = [...state.currentModel.fields, field]
      return {
        currentModel: { ...state.currentModel, fields: newFields },
        isDirty: true,
      }
    })
  },

  updateField: (field: Field) => {
    set((state) => {
      if (!state.currentModel) return state
      const newFields = state.currentModel.fields.map((f) => (f.id === field.id ? field : f))
      return {
        currentModel: { ...state.currentModel, fields: newFields },
        isDirty: true,
      }
    })
  },

  previewModel: async () => {
    const state = get()
    if (!state.currentModel) return null

    set({ loading: true })
    try {
      const response = await fetch(`/api/models/${state.currentModel.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: state.currentModel, dryRun: true }),
      })

      if (!response.ok) throw new Error('Failed to generate preview')

      const result = await response.json()
      return { ops: result.ops, destructive: result.destructive }
    } catch (error: unknown) {
      const err = error as Error
      console.error('Error', err)
      toast.error(err.message || 'Failed')
      return null
    } finally {
      set({ loading: false })
    }
  },

  deleteField: (fieldId: string) => {
    set((state) => {
      if (!state.currentModel) return state
      const newFields = state.currentModel.fields.filter((f) => f.id !== fieldId)
      return {
        currentModel: { ...state.currentModel, fields: newFields },
        isDirty: true,
      }
    })
  },
}))
