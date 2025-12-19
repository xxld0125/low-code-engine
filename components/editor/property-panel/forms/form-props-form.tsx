'use client'

import { ComponentNode } from '@/types/editor'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/stores/editor-store'
import { useModelStore } from '@/stores/useModelStore'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PropertyInput } from '../property-input'

interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select'
  required: boolean
  placeholder?: string
}

interface FormPropsFormProps {
  component: ComponentNode
}

export function FormPropsForm({ component }: FormPropsFormProps) {
  const updateComponentProps = useEditorStore((state) => state.updateComponentProps)
  const { models, fetchModels } = useModelStore()
  const [isGenerating, setIsGenerating] = useState(false)

  const props = component.props as {
    tableName?: string
    mode?: 'insert' | 'update'
    fields?: FormField[]
  }

  const [fields, setFields] = useState<FormField[]>(props.fields || [])

  // Fetch models on mount
  useEffect(() => {
    if (models.length === 0) {
      fetchModels()
    }
  }, [models.length, fetchModels])

  // Sync local state with component props
  useEffect(() => {
    setFields(props.fields || [])
  }, [props.fields])

  const handleTableNameChange = (tableName: string) => {
    updateComponentProps(component.id, { tableName })
  }

  const handleModeChange = (mode: 'insert' | 'update') => {
    updateComponentProps(component.id, { mode })
  }

  const addField = () => {
    const newField: FormField = {
      name: '',
      label: '',
      type: 'text',
      required: false,
    }
    const updatedFields = [...fields, newField]
    setFields(updatedFields)
    updateComponentProps(component.id, { fields: updatedFields })
  }

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index)
    setFields(updatedFields)
    updateComponentProps(component.id, { fields: updatedFields })
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updatedFields = fields.map((field, i) => (i === index ? { ...field, ...updates } : field))
    setFields(updatedFields)
    updateComponentProps(component.id, { fields: updatedFields })
  }

  const autoGenerateFields = async () => {
    if (!props.tableName) {
      alert('Please select a table first')
      return
    }

    // Find the model by table_name
    const selectedModel = models.find((m) => m.table_name === props.tableName)
    if (!selectedModel) {
      alert('Model not found. Please ensure the table is defined in Data Center.')
      return
    }

    setIsGenerating(true)
    try {
      // Filter out system fields and generate form fields from model fields
      const userFields = selectedModel.fields.filter((f) => !f.isSystem)

      const generatedFields: FormField[] = userFields.map((field) => ({
        name: field.key,
        label: field.name, // Use display name from Data Center
        type: mapFieldType(field.type),
        required: field.validation?.required ?? false,
      }))

      setFields(generatedFields)
      updateComponentProps(component.id, { fields: generatedFields })
    } catch (error) {
      console.error('Auto-generate fields error:', error)
      alert('Failed to auto-generate fields. Please check console for details.')
    } finally {
      setIsGenerating(false)
    }
  }

  const mapFieldType = (type: string): FormField['type'] => {
    switch (type) {
      case 'number':
        return 'number'
      case 'boolean':
        return 'boolean'
      case 'date':
      case 'datetime':
        return 'date'
      case 'select':
        return 'select'
      default:
        return 'text'
    }
  }

  return (
    <div className="space-y-6">
      {/* Table Name - Dropdown Select */}
      <div>
        <Label htmlFor="form-table-name" className="text-xs font-medium">
          Table Name
        </Label>
        <Select
          value={props.tableName || ''}
          onValueChange={(value) => handleTableNameChange(value)}
        >
          <SelectTrigger id="form-table-name" className="mt-1.5 font-mono text-[13px]">
            <SelectValue placeholder="Select a table..." />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.table_name}>
                {model.name} ({model.table_name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 text-[11px] text-gray-500">Select a table from Data Center</p>
      </div>

      {/* Mode */}
      <div>
        <Label htmlFor="form-mode" className="text-xs font-medium">
          Mode
        </Label>
        <Select
          value={props.mode || 'insert'}
          onValueChange={(value: string) => handleModeChange(value as 'insert' | 'update')}
        >
          <SelectTrigger id="form-mode" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="insert">Insert (Create new record)</SelectItem>
            <SelectItem value="update">Update (Edit existing record)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fields Configuration */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-xs font-medium">Fields</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={autoGenerateFields}
              disabled={isGenerating || !props.tableName}
              aria-label="Auto-generate form fields from database schema"
              className="h-7 gap-1 text-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generating...
                </>
              ) : (
                'Auto-Fill Fields'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addField}
              aria-label="Add new field"
              className="h-7 gap-1 text-xs"
            >
              <Plus className="h-3 w-3" />
              Add Field
            </Button>
          </div>
        </div>

        {fields.length === 0 ? (
          <div className="rounded border border-dashed border-gray-300 p-4 text-center text-xs text-gray-500">
            No fields configured. Use &quot;Auto-Fill Fields&quot; or &quot;Add Field&quot; to
            start.
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={index} className="space-y-2 rounded border border-gray-200 bg-white p-3">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-gray-700">Field {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(index)}
                    aria-label={`Remove field ${index + 1}`}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <PropertyInput
                      placeholder="Field name"
                      value={field.name}
                      onValueChange={(value) => updateField(index, { name: value })}
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <PropertyInput
                      placeholder="Label"
                      value={field.label}
                      onValueChange={(value) => updateField(index, { label: value })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Select
                      value={field.type}
                      onValueChange={(value: string) =>
                        updateField(index, { type: value as FormField['type'] })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <PropertyInput
                      placeholder="Placeholder (optional)"
                      value={field.placeholder || ''}
                      onValueChange={(value) => updateField(index, { placeholder: value })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`required-${index}`}
                    checked={field.required}
                    onCheckedChange={(checked) =>
                      updateField(index, { required: Boolean(checked) })
                    }
                  />
                  <label htmlFor={`required-${index}`} className="text-xs text-gray-600">
                    Required
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
