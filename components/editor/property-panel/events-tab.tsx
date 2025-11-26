'use client'

import { ComponentNode, ActionConfig, ActionType } from '@/types/editor'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEditorStore } from '@/stores/editor-store'
import { Plus, Trash2, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { PropertyInput } from './property-input'

interface EventsTabProps {
  component: ComponentNode
}

export function EventsTab({ component }: EventsTabProps) {
  const updateComponentActions = useEditorStore((state) => state.updateComponentActions)
  const [actions, setActions] = useState<ActionConfig[]>(component.actions || [])

  // Sync local state with component actions
  useEffect(() => {
    setActions(component.actions || [])
  }, [component.actions])

  const addAction = () => {
    const newAction: ActionConfig = {
      trigger: 'onClick',
      type: ActionType.SHOW_TOAST,
      payload: { type: 'success', message: 'Action triggered' },
    }
    const updatedActions = [...actions, newAction]
    setActions(updatedActions)
    updateComponentActions(component.id, updatedActions)
  }

  const removeAction = (index: number) => {
    const updatedActions = actions.filter((_, i) => i !== index)
    setActions(updatedActions)
    updateComponentActions(component.id, updatedActions)
  }

  const updateAction = (index: number, updates: Partial<ActionConfig>) => {
    const updatedActions = actions.map((action, i) => {
      if (i === index) {
        const newAction = { ...action, ...updates }
        // Reset payload when action type changes
        if (updates.type && updates.type !== action.type) {
          newAction.payload = getDefaultPayload(updates.type)
        }
        return newAction
      }
      return action
    })
    setActions(updatedActions)
    updateComponentActions(component.id, updatedActions)
  }

  const updatePayload = (index: number, key: string, value: unknown) => {
    const updatedActions = actions.map((action, i) => {
      if (i === index) {
        return {
          ...action,
          payload: { ...action.payload, [key]: value },
        }
      }
      return action
    })
    setActions(updatedActions)
    updateComponentActions(component.id, updatedActions)
  }

  const getDefaultPayload = (type: ActionType): ActionConfig['payload'] => {
    switch (type) {
      case ActionType.OPEN_MODAL:
      case ActionType.CLOSE_MODAL:
        return { modalId: '' }
      case ActionType.NAVIGATE:
        return { url: '' }
      case ActionType.SHOW_TOAST:
        return { type: 'success', message: '' }
      case ActionType.REFRESH_TABLE:
        return { tableId: '' }
      case ActionType.SUBMIT_FORM:
        return { formId: '' }
      default:
        return {}
    }
  }

  const renderPayloadFields = (action: ActionConfig, index: number) => {
    const payload = action.payload as Record<string, unknown>

    switch (action.type) {
      case ActionType.OPEN_MODAL:
      case ActionType.CLOSE_MODAL:
        return (
          <div>
            <Label htmlFor={`modalId-${index}`} className="text-xs">
              Modal ID
            </Label>
            <PropertyInput
              id={`modalId-${index}`}
              placeholder="modal-123"
              value={(payload.modalId as string) || ''}
              onValueChange={(value) => updatePayload(index, 'modalId', value)}
              className="mt-1.5 font-mono text-xs"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              The ID of the Modal component to{' '}
              {action.type === ActionType.OPEN_MODAL ? 'open' : 'close'}
            </p>
          </div>
        )

      case ActionType.NAVIGATE:
        return (
          <div>
            <Label htmlFor={`url-${index}`} className="text-xs">
              URL
            </Label>
            <PropertyInput
              id={`url-${index}`}
              placeholder="/dashboard or https://..."
              value={(payload.url as string) || ''}
              onValueChange={(value) => updatePayload(index, 'url', value)}
              className="mt-1.5 font-mono text-xs"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Relative path (e.g., /dashboard) or absolute URL
            </p>
          </div>
        )

      case ActionType.SHOW_TOAST:
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`toast-type-${index}`} className="text-xs">
                Toast Type
              </Label>
              <Select
                value={(payload.type as string) || 'success'}
                onValueChange={(value: string) => updatePayload(index, 'type', value)}
              >
                <SelectTrigger id={`toast-type-${index}`} className="mt-1.5 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`toast-message-${index}`} className="text-xs">
                Message
              </Label>
              <PropertyInput
                id={`toast-message-${index}`}
                placeholder="Operation completed"
                value={(payload.message as string) || ''}
                onValueChange={(value) => updatePayload(index, 'message', value)}
                className="mt-1.5 text-xs"
              />
            </div>
          </div>
        )

      case ActionType.REFRESH_TABLE:
        return (
          <div>
            <Label htmlFor={`tableId-${index}`} className="text-xs">
              Table ID (Optional)
            </Label>
            <PropertyInput
              id={`tableId-${index}`}
              placeholder="Leave empty to refresh all tables"
              value={(payload.tableId as string) || ''}
              onValueChange={(value) => updatePayload(index, 'tableId', value)}
              className="mt-1.5 font-mono text-xs"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              If empty, all Table components will refresh
            </p>
          </div>
        )

      case ActionType.SUBMIT_FORM:
        return (
          <div>
            <Label htmlFor={`formId-${index}`} className="text-xs">
              Form ID (Optional)
            </Label>
            <PropertyInput
              id={`formId-${index}`}
              placeholder="Leave empty for current form"
              value={(payload.formId as string) || ''}
              onValueChange={(value) => updatePayload(index, 'formId', value)}
              className="mt-1.5 font-mono text-xs"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Only needed if triggering a different form
            </p>
          </div>
        )

      default:
        return null
    }
  }

  const getSupportedTriggers = (
    componentType: ComponentNode['type']
  ): Array<'onClick' | 'onSubmit'> => {
    switch (componentType) {
      case 'Button':
        return ['onClick']
      case 'Form':
        return ['onSubmit']
      default:
        return ['onClick']
    }
  }

  const supportedTriggers = getSupportedTriggers(component.type)

  return (
    <div className="space-y-4 p-4">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-accent">
              Event Configuration
            </h3>
            <p className="mt-0.5 text-[11px] text-gray-500">
              Configure actions to execute when events are triggered
            </p>
          </div>
        </div>

        {supportedTriggers.length === 0 ? (
          <div className="rounded border border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-600">
            This component type does not support event handlers.
          </div>
        ) : (
          <>
            <div className="mb-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAction}
                aria-label="Add new action"
                className="h-8 w-full gap-2 text-xs"
              >
                <Plus className="h-3 w-3" />
                Add Action
              </Button>
            </div>

            {actions.length === 0 ? (
              <div className="rounded border border-dashed border-gray-300 p-6 text-center text-xs text-gray-500">
                <Zap className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p>No actions configured.</p>
                <p className="mt-1">
                  Click &quot;Add Action&quot; to create your first event handler.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {actions.map((action, index) => (
                  <div
                    key={index}
                    className="rounded border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    {/* Header */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-accent" />
                        <span className="text-xs font-semibold text-gray-700">
                          Action {index + 1}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAction(index)}
                        aria-label={`Remove action ${index + 1}`}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Trigger Selection */}
                    <div className="mb-3">
                      <Label htmlFor={`trigger-${index}`} className="text-xs">
                        Trigger Event
                      </Label>
                      <Select
                        value={action.trigger}
                        onValueChange={(value: string) =>
                          updateAction(index, { trigger: value as 'onClick' | 'onSubmit' })
                        }
                      >
                        <SelectTrigger id={`trigger-${index}`} className="mt-1.5 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {supportedTriggers.includes('onClick') && (
                            <SelectItem value="onClick">On Click</SelectItem>
                          )}
                          {supportedTriggers.includes('onSubmit') && (
                            <SelectItem value="onSubmit">On Submit</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Type Selection */}
                    <div className="mb-3">
                      <Label htmlFor={`action-type-${index}`} className="text-xs">
                        Action Type
                      </Label>
                      <Select
                        value={action.type}
                        onValueChange={(value: string) =>
                          updateAction(index, { type: value as ActionType })
                        }
                      >
                        <SelectTrigger id={`action-type-${index}`} className="mt-1.5 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ActionType.OPEN_MODAL}>Open Modal</SelectItem>
                          <SelectItem value={ActionType.CLOSE_MODAL}>Close Modal</SelectItem>
                          <SelectItem value={ActionType.SUBMIT_FORM}>Submit Form</SelectItem>
                          <SelectItem value={ActionType.REFRESH_TABLE}>Refresh Table</SelectItem>
                          <SelectItem value={ActionType.NAVIGATE}>Navigate</SelectItem>
                          <SelectItem value={ActionType.SHOW_TOAST}>Show Toast</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dynamic Payload Fields */}
                    <div className="rounded border border-gray-100 bg-gray-50 p-3">
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
                        Parameters
                      </div>
                      {renderPayloadFields(action, index)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
