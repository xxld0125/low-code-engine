'use client'

import { ComponentNode } from '@/types/editor'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/stores/editor-store'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { PropertyInput } from '../property-input'

interface TableColumn {
  field: string
  header: string
  width?: number
  visible: boolean
  format?: string
}

interface TablePropsFormProps {
  component: ComponentNode
}

export function TablePropsForm({ component }: TablePropsFormProps) {
  const updateComponentProps = useEditorStore((state) => state.updateComponentProps)

  const props = component.props as {
    tableName?: string
    pageSize?: number
    columns?: TableColumn[]
  }

  const [columns, setColumns] = useState<TableColumn[]>(props.columns || [])

  // Sync local state with component props
  useEffect(() => {
    setColumns(props.columns || [])
  }, [props.columns])

  const handleTableNameChange = (tableName: string) => {
    updateComponentProps(component.id, { tableName })
  }

  const handlePageSizeChange = (pageSize: string) => {
    updateComponentProps(component.id, { pageSize: parseInt(pageSize) || 10 })
  }

  const addColumn = () => {
    const newColumn: TableColumn = {
      field: '',
      header: '',
      visible: true,
    }
    const updatedColumns = [...columns, newColumn]
    setColumns(updatedColumns)
    updateComponentProps(component.id, { columns: updatedColumns })
  }

  const removeColumn = (index: number) => {
    const updatedColumns = columns.filter((_, i) => i !== index)
    setColumns(updatedColumns)
    updateComponentProps(component.id, { columns: updatedColumns })
  }

  const updateColumn = (index: number, updates: Partial<TableColumn>) => {
    const updatedColumns = columns.map((col, i) => (i === index ? { ...col, ...updates } : col))
    setColumns(updatedColumns)
    updateComponentProps(component.id, { columns: updatedColumns })
  }

  return (
    <div className="space-y-6">
      {/* Table Name */}
      <div>
        <Label htmlFor="table-name" className="text-xs font-medium">
          Table Name
        </Label>
        <PropertyInput
          id="table-name"
          placeholder="e.g., users, posts"
          value={props.tableName || ''}
          onValueChange={(value) => handleTableNameChange(value)}
          className="mt-1.5 font-mono text-[13px]"
        />
        <p className="mt-1 text-[11px] text-gray-500">The Supabase table to bind</p>
      </div>

      {/* Page Size */}
      <div>
        <Label htmlFor="page-size" className="text-xs font-medium">
          Page Size
        </Label>
        <PropertyInput
          id="page-size"
          type="number"
          placeholder="10"
          value={props.pageSize || 10}
          onValueChange={(value) => handlePageSizeChange(value)}
          className="mt-1.5"
        />
      </div>

      {/* Columns Configuration */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-xs font-medium">Columns</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addColumn}
            aria-label="Add new column"
            className="h-7 gap-1 text-xs"
          >
            <Plus className="h-3 w-3" />
            Add Column
          </Button>
        </div>

        {columns.length === 0 ? (
          <div className="rounded border border-dashed border-gray-300 p-4 text-center text-xs text-gray-500">
            No columns configured. Click &quot;Add Column&quot; to start.
          </div>
        ) : (
          <div className="space-y-2">
            {columns.map((column, index) => (
              <div key={index} className="space-y-2 rounded border border-gray-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-700">Column {index + 1}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeColumn(index)}
                    aria-label={`Remove column ${index + 1}`}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <PropertyInput
                      placeholder="Field name"
                      value={column.field}
                      onValueChange={(value) => updateColumn(index, { field: value })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <PropertyInput
                      placeholder="Header text"
                      value={column.header}
                      onValueChange={(value) => updateColumn(index, { header: value })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`visible-${index}`}
                      checked={column.visible}
                      onCheckedChange={(checked) =>
                        updateColumn(index, { visible: Boolean(checked) })
                      }
                    />
                    <label htmlFor={`visible-${index}`} className="text-xs text-gray-600">
                      Visible
                    </label>
                  </div>
                  <div className="flex-1">
                    <PropertyInput
                      placeholder="Width (optional)"
                      type="number"
                      value={column.width || ''}
                      onValueChange={(value) =>
                        updateColumn(index, {
                          width: value ? parseInt(value) : undefined,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
