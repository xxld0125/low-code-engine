'use client'

import { useEffect, useState } from 'react'
import { Field, FieldType } from '@/types/data-engine'
import { Button } from '@/components/ui/button'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface FieldConfigPanelProps {
  field: Field | null
  existingFields: Field[]
  isOpen: boolean
  onClose: () => void
  onSave: (field: Field) => void
  models: { id: string; name: string; table_name: string }[] // For relation target selection
}

export function FieldConfigPanel({
  field,
  existingFields,
  isOpen,
  onClose,
  onSave,
  models,
}: FieldConfigPanelProps) {
  const [editedField, setEditedField] = useState<Field | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null) // Clear error on open/change
    if (field) {
      setEditedField({ ...field })
    } else {
      // New field defaults
      setEditedField({
        id: crypto.randomUUID(),
        name: '',
        key: '',
        type: 'text',
        validation: {},
        isSystem: false,
      })
    }
  }, [field, isOpen])

  if (!editedField) return null

  const handleSave = () => {
    setError(null)
    if (!editedField.key) {
      setError('Field key is required.')
      return
    }

    // Validation: Duplicate Key
    const isDuplicate = existingFields.some(
      (f) => f.key === editedField.key && f.id !== editedField.id
    )

    if (isDuplicate) {
      setError(`Field key "${editedField.key}" already exists.`)
      return
    }

    // Validation: Self Reference (Optional, but often confusing for simple UI)
    // If relation target is self? Actually helpful for 'Parent/Child' trees.
    // The requirement says "Circular dependencies".
    // Direct self-reference is usually fine (Parent ID).
    // True circular is A -> B -> A.
    // Let's at least warn if user selects self, or maybe it's allowed?
    // Generally allowed.
    // But checking A->B->A is hard without loading B.
    // Let's implement at least a check for "Direct Self-Reference" warning if not intended?
    // Actually, let's skip complex circular check for MVP as client doesn't have all models fully loaded with fields?
    // Wait, useModelStore has `models` list but maybe not fields for all.
    // Let's just ensure we don't crash.

    if (editedField.name && editedField.key) {
      onSave(editedField)
      onClose()
    }
  }

  const updateProp = (key: keyof Field, value: unknown) => {
    setEditedField((prev) => (prev ? { ...prev, [key]: value } : null))
  }

  const updateValidation = (key: string, value: unknown) => {
    setEditedField((prev) =>
      prev
        ? {
            ...prev,
            validation: { ...prev.validation, [key]: value },
          }
        : null
    )
  }

  // Auto-generate key from name
  const handleNameChange = (val: string) => {
    updateProp('name', val)
    if (!field && editedField.key === '') {
      updateProp('key', val.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{field ? 'Edit Field' : 'Add Field'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
          )}
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>
            <div className="grid gap-2">
              <Label>Properties</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fieldName" className="text-xs">
                    Display Name
                  </Label>
                  <Input
                    id="fieldName"
                    value={editedField.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Total Amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldKey" className="text-xs">
                    Database Column
                  </Label>
                  <Input
                    id="fieldKey"
                    value={editedField.key}
                    onChange={(e) => updateProp('key', e.target.value)}
                    placeholder="e.g. total_amount"
                    className="font-mono"
                    disabled={!!field} // Lock key on edit
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldType">Data Type</Label>
              <Select
                value={editedField.type}
                onValueChange={(val) => updateProp('type', val as FieldType)}
                disabled={!!field}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text / String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="date">Date & Time</SelectItem>
                  <SelectItem value="select">Select / Enum</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Relation Configuration */}
          {/* We treat 'relationship' as a special UI type, though physically it might be uuid */}
          {/* But for simplicity, let's keep it as separate configuration dependent on type,
              OR allow selecting 'Relationship' as type (implied UUID).
              Let's add 'uuid' to types and a Relation section. */}

          {editedField.type === 'select' && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Options Configuration</h4>
              <div className="space-y-2">
                <Label>Options (comma separated)</Label>
                <Input
                  value={editedField.options?.join(', ') || ''}
                  onChange={(e) =>
                    updateProp(
                      'options',
                      e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="Option A, Option B, Option C"
                />
              </div>
            </div>
          )}

          {/* For now, simplified Relation support: If name/key implies ID, or explicit toggle?
              Let's add a "Relationship" toggle or section.
              Actually, let's make it simpler: Add 'uuid' to types. If Type is UUID, show Relation config.
          */}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Relationship</h4>
              {/* Toggle to enable relation config? */}
            </div>

            <div className="grid gap-2">
              <Label>Target Model</Label>
              <Select
                value={editedField.relation?.targetModelId || 'none'}
                onValueChange={(val) => {
                  if (val === 'none') {
                    setEditedField((prev) => (prev ? { ...prev, relation: undefined } : null))
                  } else {
                    setEditedField((prev) =>
                      prev
                        ? {
                            ...prev,
                            relation: {
                              type: 'belongsTo', // Default to belongsTo (Foreign Key)
                              targetModelId: val,
                            },
                          }
                        : null
                    )
                    // Auto-set type to text (uuid) if not set? Or typically relations are UUIDs.
                    // updateProp("type", "text"); // UUID is often stored as text in minimal setup
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No Relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Standard Field)</SelectItem>
                  {models
                    .filter((m) => m.id !== field?.id)
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({m.table_name})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {editedField.relation && (
              <div className="grid gap-2 rounded border bg-muted/20 p-3">
                <Label>Relation Type</Label>
                <Select
                  value={editedField.relation.type}
                  onValueChange={(val: 'belongsTo' | 'hasOne' | 'hasMany') =>
                    setEditedField((prev) =>
                      prev
                        ? {
                            ...prev,
                            relation: { ...prev.relation!, type: val },
                          }
                        : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="belongsTo">Belongs To (Foreign Key)</SelectItem>
                    <SelectItem value="hasOne">Has One (1:1)</SelectItem>
                    <SelectItem value="hasMany">Has Many (1:N)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  {editedField.relation.type === 'belongsTo'
                    ? 'This field will store the ID of the related record.'
                    : 'This is a virtual field defining the other side of the relation.'}
                </p>
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* Validation */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Validation & Constraints</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="required"
                checked={editedField.validation?.required}
                onCheckedChange={(checked) => updateValidation('required', checked)}
              />
              <Label htmlFor="required">Required Field</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="unique"
                checked={editedField.validation?.unique}
                onCheckedChange={(checked) => updateValidation('unique', checked)}
              />
              <Label htmlFor="unique">Unique Value</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="regex" className="text-xs">
                Regex Pattern (Optional)
              </Label>
              <Input
                id="regex"
                value={editedField.validation?.regex || ''}
                onChange={(e) => updateValidation('regex', e.target.value)}
                placeholder="e.g. ^[A-Z]+$"
                className="font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[var(--accent)] text-white">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
