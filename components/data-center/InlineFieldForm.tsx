'use client'

import { useEffect, useState, useRef } from 'react'
import { Field, FieldType } from '@/types/data-engine'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface InlineFieldFormProps {
  field: Field
  existingFields: Field[]
  onChange: (updatedField: Field) => void
  onDelete: (fieldId: string) => void
  models: { id: string; name: string; table_name: string }[]
}

export function InlineFieldForm({
  field,
  existingFields,
  onChange,
  onDelete,
  models,
}: InlineFieldFormProps) {
  const [localField, setLocalField] = useState<Field>(field)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Validation
  const isDuplicate = existingFields.some((f) => f.key === localField.key && f.id !== localField.id)
  const isInvalidFormat = localField.key ? !/^[a-z0-9_]+$/.test(localField.key) : false

  // Sync local state when prop changes
  useEffect(() => {
    setLocalField(field)

    // Auto-focus if it looks like a new field
    if (field.name === 'New Field') {
      setTimeout(() => {
        nameInputRef.current?.focus()
        nameInputRef.current?.select() // Optional: select text to overwrite easily
      }, 100)
    }
  }, [field]) // Reset when field prop changes

  // But we want "Controlled" component behavior to valid extent or Local buffering?
  // Ideally, inline form updates the store immediately OR has a "Save" button?
  // Mockup implies real-time or auto-save feel, typically.
  // Given we have a "Publish" button globally, local changes to the "Draft" in store should be immediate.
  // So let's propagate changes up immediately.

  const updateProp = (key: keyof Field, value: unknown) => {
    const updated = { ...localField, [key]: value }
    setLocalField(updated)
    onChange(updated) // Propagate immediately
  }

  const updateValidation = (key: string, value: unknown) => {
    const updated = {
      ...localField,
      validation: { ...localField.validation, [key]: value },
    }
    setLocalField(updated)
    onChange(updated)
  }

  const handleNameChange = (val: string) => {
    const updated = { ...localField, name: val }

    const currentSlug = localField.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')
    const isKeyUnchanged =
      !localField.key || localField.key === currentSlug || localField.key === 'new_field'

    if (isKeyUnchanged && !localField.isSystem) {
      updated.key = val.toLowerCase().replace(/[^a-z0-9_]/g, '_')
    }
    setLocalField(updated)
    onChange(updated)
  }

  return (
    <div className="max-w-[600px] duration-300 animate-in fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3 h-3.5 w-1 bg-[#16AA98]"></div>
          <h2 className="text-[14px] font-bold uppercase tracking-wide text-[#383838]">
            Field Configuration
          </h2>
        </div>
        {!localField.isSystem && (
          <Button
            variant="ghost"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onDelete(localField.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Field
          </Button>
        )}
      </div>

      <div className="space-y-8">
        {/* Section 1: General */}
        <section className="space-y-4">
          {/* Key & Name Row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[12px] font-medium text-[#666666]">
                Field Key (DB Column)
              </Label>
              <Input
                value={localField.key}
                onChange={(e) => updateProp('key', e.target.value)}
                disabled={localField.isSystem}
                className={`h-9 rounded-none border-[1.5px] px-3 font-mono text-[13px] focus-visible:ring-0 ${isDuplicate || isInvalidFormat ? 'border-red-500 bg-red-50' : 'border-[#e5e5e5] focus-visible:border-[#16AA98]'}`}
              />
              {isDuplicate && <p className="mt-1 text-[11px] text-red-500">Key already exists.</p>}
              {isInvalidFormat && (
                <p className="mt-1 text-[11px] text-red-500">
                  Only lowercase letters, numbers, and underscores.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[12px] font-medium text-[#666666]">Display Name</Label>
              <Input
                ref={nameInputRef}
                value={localField.name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={localField.isSystem}
                className="h-9 rounded-none border-[1.5px] border-[#e5e5e5] px-3 text-[13px] focus-visible:border-[#16AA98] focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Type Row */}
          <div className="space-y-2">
            <Label className="text-[12px] font-medium text-[#666666]">Data Type</Label>
            <Select
              value={localField.relation ? 'relation' : localField.type}
              onValueChange={(val) => {
                if (val === 'relation') {
                  // Initialize relation config if not present
                  const updated = {
                    ...localField,
                    type: 'text' as FieldType, // Physical type is text (UUID)
                    relation: {
                      type: 'belongsTo' as const,
                      targetModelId: models.length > 0 ? models[0].id : '', // Default to first model
                    },
                  }
                  setLocalField(updated)
                  onChange(updated)
                } else {
                  // Clear relation if switching away
                  const updated = { ...localField, type: val as FieldType }
                  delete updated.relation
                  setLocalField(updated)
                  onChange(updated)
                }
              }}
              disabled={localField.isSystem}
            >
              <SelectTrigger className="h-9 rounded-none border-[1.5px] border-[#e5e5e5] focus:border-[#16AA98] focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text / String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="date">Date & Time</SelectItem>
                <SelectItem value="select">Select / Enum</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="relation" className="font-medium text-[#16AA98]">
                  Link to another Model (Relation)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options Row (Conditional) */}
          {localField.type === 'select' && !localField.relation && (
            <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-1">
              <Label className="text-[12px] font-medium text-[#666666]">
                Options (Comma separated)
              </Label>
              <Input
                value={localField.options?.join(', ') || ''}
                onChange={(e) =>
                  updateProp(
                    'options',
                    e.target.value.split(',').map((s) => s.trim())
                  )
                }
                placeholder="Option A, Option B, Option C"
                className="h-9 rounded-none border-[1.5px] border-[#e5e5e5] px-3 text-[13px] focus-visible:border-[#16AA98] focus-visible:ring-0"
              />
              <p className="text-[10px] text-[#999999]">
                Enter values separated by commas. These will be available as a dropdown in the UI.
              </p>
            </div>
          )}
        </section>

        <div className="h-px bg-[#e5e5e5]" />

        {/* Section 2: Constraints */}
        <section className="space-y-4">
          <h3 className="mb-4 text-[12px] font-bold uppercase tracking-wider text-[#999999]">
            Constraints
          </h3>

          {/* Checkboxes Card */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`border p-4 ${localField.validation?.required ? 'border-[#16AA98] bg-[#16AA98]/5' : 'border-[#e5e5e5] bg-white'} cursor-pointer transition-all`}
              onClick={() =>
                !localField.isSystem &&
                updateValidation('required', !localField.validation?.required)
              }
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={localField.validation?.required}
                  disabled={localField.isSystem}
                />
                <div>
                  <div className="text-[13px] font-semibold text-[#383838]">Required</div>
                  <div className="text-[11px] text-[#999999]">Cannot be empty</div>
                </div>
              </div>
            </div>

            <div
              className={`border p-4 ${localField.validation?.unique ? 'border-[#16AA98] bg-[#16AA98]/5' : 'border-[#e5e5e5] bg-white'} cursor-pointer transition-all`}
              onClick={() =>
                !localField.isSystem && updateValidation('unique', !localField.validation?.unique)
              }
            >
              <div className="flex items-center space-x-3">
                <Checkbox checked={localField.validation?.unique} disabled={localField.isSystem} />
                <div>
                  <div className="text-[13px] font-semibold text-[#383838]">Unique</div>
                  <div className="text-[11px] text-[#999999]">No duplicate values</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Relations (Conditional) */}
        {localField.relation && (
          <>
            <div className="h-px bg-[#e5e5e5]" />
            <section className="space-y-4 duration-300 animate-in slide-in-from-top-2">
              <h3 className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#16AA98]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#16AA98]" />
                Relationship Configuration
              </h3>

              <div className="space-y-5 rounded-sm border border-[#16AA98]/20 bg-[#16AA98]/5 p-5">
                <div className="space-y-2">
                  <Label className="text-[12px] font-medium text-[#666666]">Target Model</Label>
                  <Select
                    value={localField.relation.targetModelId}
                    onValueChange={(val) => {
                      const updated = {
                        ...localField,
                        relation: { ...localField.relation!, targetModelId: val },
                      }
                      setLocalField(updated)
                      onChange(updated)
                    }}
                  >
                    <SelectTrigger className="h-9 border-[1.5px] border-[#16AA98]/30 bg-white font-medium">
                      <SelectValue placeholder="Select a model..." />
                    </SelectTrigger>
                    <SelectContent>
                      {models
                        .filter((m) => m.id !== 'current-model-id-placeholder') // Optionally filter out itself? Usually recursive relations are allowed.
                        .map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}{' '}
                            <span className="ml-2 font-mono text-xs text-muted-foreground">
                              ({model.table_name})
                            </span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[12px] font-medium text-[#666666]">Relation Type</Label>
                    <Select
                      value={localField.relation.type}
                      onValueChange={(val: 'belongsTo' | 'hasOne' | 'hasMany') => {
                        const updated = {
                          ...localField,
                          relation: { ...localField.relation!, type: val },
                        }
                        setLocalField(updated)
                        onChange(updated)
                      }}
                    >
                      <SelectTrigger className="h-9 border-[1.5px] border-[#e5e5e5] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="belongsTo">Belongs To (Many-to-One)</SelectItem>
                        {/* Physical fields on this side imply BelongsTo usually.
                                            HasMany would be on the OTHER side virtually.
                                            HasOne is rare physically unless unique. */}
                        <SelectItem value="hasOne">Has One (1:1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border border-[#16AA98]/10 bg-white p-3 text-xs leading-relaxed text-[#666666]">
                    {localField.relation.type === 'belongsTo' && (
                      <>
                        This field will store the <strong>ID</strong> of the selected model.
                        Multiple records in this table can point to the same target record.
                      </>
                    )}
                    {localField.relation.type === 'hasOne' && (
                      <>
                        This field will store the <strong>ID</strong> of the selected model. Each
                        record in this table must point to a <strong>unique</strong> target record.
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
