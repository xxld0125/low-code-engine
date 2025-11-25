'use client'

import { ActionConfig, ActionType } from '@/types/editor'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useRuntimeStore } from '@/stores/runtime-store'
import { resolveExpression } from './expression-resolver'

export function useActionExecutor() {
  const router = useRouter()
  const { openModal, closeModal, globalContext } = useRuntimeStore()

  const executeAction = async (
    action: ActionConfig,
    localContext: Record<string, unknown> = {}
  ) => {
    const context = { ...globalContext, ...localContext }
    console.log('Executing action:', action.type, action.payload)

    switch (action.type) {
      case ActionType.NAVIGATE: {
        const payload = action.payload as { url: string }
        if (payload.url) {
          const url = resolveExpression(payload.url, context) as string
          router.push(url)
        }
        break
      }

      case ActionType.SHOW_TOAST: {
        const { type, message } = action.payload as {
          type: 'success' | 'error' | 'info'
          message: string
        }
        const resolvedMessage = resolveExpression(message, context) as string

        if (type === 'error') toast.error(resolvedMessage)
        else if (type === 'success') toast.success(resolvedMessage)
        else toast.info(resolvedMessage)
        break
      }

      case ActionType.OPEN_MODAL: {
        const { modalId } = action.payload as { modalId: string }
        if (modalId) openModal(modalId)
        break
      }

      case ActionType.CLOSE_MODAL: {
        const { modalId } = action.payload as { modalId: string }
        if (modalId) closeModal(modalId)
        break
      }

      case ActionType.SUBMIT_FORM: {
        // Form submission is typically handled by the Form component itself
        // possibly triggering this action.
        // If this action is triggered by a button OUTSIDE the form, we need a way to submit the form.
        // For now, we assume the button is inside the form or we use an event bus.
        const { formId } = action.payload as { formId?: string }
        if (formId) {
          // Dispatch a custom event that the form listens to?
          window.dispatchEvent(new CustomEvent(`form:submit:${formId}`))
        }
        break
      }

      case ActionType.REFRESH_TABLE: {
        const { tableId } = action.payload as { tableId?: string }
        if (tableId) {
          // Invalidate React Query cache
          // We'll need access to queryClient here or dispatch an event
          window.dispatchEvent(new CustomEvent(`table:refresh:${tableId}`))
        }
        break
      }

      default:
        console.warn('Unknown action type:', action.type)
    }
  }

  return { executeAction }
}
