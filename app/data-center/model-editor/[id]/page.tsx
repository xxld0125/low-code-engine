'use client'

import { useEffect, useState } from 'react'
import { useModelStore } from '@/stores/useModelStore'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, ArrowLeft, Settings2, FileCode } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { InlineFieldForm } from '@/components/data-center/InlineFieldForm'
import { Field } from '@/types/data-engine'

export default function ModelEditorPage() {
  // Use standard useParams hook for Client Component
  const { id } = useParams() as { id: string }
  const {
    fetchModel,
    currentModel,
    loading,
    addField,
    updateField,
    deleteField,
    models,
    previewModel,
  } = useModelStore()

  const [selectedField, setSelectedField] = useState<Field | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewOps, setPreviewOps] = useState<string[]>([])

  // Auto-select first field or handle selection logic
  useEffect(() => {
    if (currentModel?.fields && currentModel.fields.length > 0 && !selectedField) {
      // Select the first business field if available, else first system field
      const businessField = currentModel.fields.find((f) => !f.isSystem)
      if (businessField) setSelectedField(businessField)
      else setSelectedField(currentModel.fields[0])
    }
  }, [currentModel, selectedField])

  useEffect(() => {
    if (id) {
      fetchModel(id)
    }
  }, [id, fetchModel])

  if (loading && !currentModel) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (!currentModel && !loading) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Model not found</h2>
        <Link href="/data-center">
          <Button variant="link">Go Back</Button>
        </Link>
      </div>
    )
  }

  const handleAddField = () => {
    // Create a new empty field
    const newField: Field = {
      id: crypto.randomUUID(),
      name: 'New Field',
      key: '',
      type: 'text',
      validation: {},
      isSystem: false,
    }
    // Add to store (Draft) immediately so it appears in list and updateField works
    addField(newField)
    setSelectedField(newField)
  }

  const handlePreview = async () => {
    const result = await previewModel()
    if (result) {
      setPreviewOps(result.ops)
      setPreviewOpen(true)
    }
  }

  const systemFields = currentModel?.fields.filter((f) => f.isSystem) || []
  const businessFields = currentModel?.fields.filter((f) => !f.isSystem) || []

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-[#f9f9f9]">
      {/* 1. Header with Breadcrumbs */}
      <header className="flex h-[56px] shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-white px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/data-center"
            className="flex h-8 w-8 items-center justify-center rounded-none border border-[#e5e5e5] text-[#383838] transition-colors hover:bg-[#f0f0f0]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-[#666666]">
            <span>Data Center</span>
            <span>/</span>
            <span className="font-semibold text-[#383838]">{currentModel?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-[#383838] hover:bg-[#f0f0f0]"
            onClick={handlePreview}
            disabled={loading}
          >
            Preview SQL
          </Button>
          <Button
            className="h-8 rounded-none bg-[#383838] text-[13px] font-semibold text-white hover:bg-black"
            onClick={() => useModelStore.getState().publishModel()}
          >
            Publish Changes
          </Button>
        </div>
      </header>

      {/* 2. Editor Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Field List */}
        <aside className="flex w-[300px] flex-col border-r border-[#e5e5e5] bg-[#f9f9f9]">
          <div className="border-b border-[#e5e5e5] p-4">
            <button
              onClick={handleAddField}
              className="flex h-9 w-full items-center justify-center gap-2 border border-[1.5px] border-[#383838] bg-transparent text-[13px] font-semibold text-[#383838] transition-colors hover:bg-white"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* System Fields */}
            {systemFields.length > 0 && (
              <div>
                <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#999999]">
                  System Fields
                </div>
                {systemFields.map((field) => (
                  <div
                    key={field.id}
                    onClick={() => setSelectedField(field)}
                    className={`flex h-11 cursor-pointer items-center border-l-[3px] px-4 text-[13px] transition-colors ${selectedField?.id === field.id ? 'border-[#16AA98] bg-white font-medium text-[#16AA98] shadow-sm' : 'border-transparent text-[#383838] hover:bg-[#e5e5e5]/50'}`}
                  >
                    <Settings2
                      className={`mr-3 h-4 w-4 ${selectedField?.id === field.id ? 'text-[#16AA98]' : 'text-[#999999]'}`}
                    />
                    <span className="flex-1 truncate">{field.name}</span>
                    <span className="rounded-sm bg-[#e0e0e0] px-1.5 py-0.5 font-mono text-[10px] uppercase text-[#666666]">
                      {field.type}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Business Fields */}
            <div>
              <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#999999]">
                Business Fields
              </div>
              {businessFields.map((field) => (
                <div
                  key={field.id}
                  onClick={() => setSelectedField(field)}
                  className={`flex h-11 cursor-pointer items-center border-l-[3px] px-4 text-[13px] transition-colors ${selectedField?.id === field.id ? 'border-[#16AA98] bg-white font-medium text-[#16AA98] shadow-sm' : 'border-transparent text-[#383838] hover:bg-[#e5e5e5]/50'}`}
                >
                  <div
                    className={`mr-3 flex h-4 w-4 items-center justify-center ${selectedField?.id === field.id ? 'text-[#16AA98]' : 'text-[#999999]'}`}
                  >
                    {/* Simple icon logic */}
                    {field.type === 'text' && 'Aa'}
                    {field.type === 'number' && '#'}
                    {field.type === 'boolean' && '☑'}
                    {field.type === 'date' && '📅'}
                    {field.type === 'select' && '≡'}
                  </div>
                  <span className="flex-1 truncate">{field.name}</span>
                  <span className="rounded-sm bg-[#e0e0e0] px-1.5 py-0.5 font-mono text-[10px] uppercase text-[#666666]">
                    {field.key}
                  </span>
                </div>
              ))}
              {businessFields.length === 0 && (
                <div className="px-4 py-2 text-xs italic text-muted-foreground">
                  No business fields.
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Panel: Config Form */}
        <main className="flex-1 overflow-y-auto bg-white p-12">
          {selectedField ? (
            <div className="h-full max-w-[800px]">
              <InlineFieldForm
                field={selectedField}
                existingFields={currentModel?.fields || []}
                models={models}
                onChange={(updated) => {
                  // Immediate update to store (Draft)
                  if (selectedField.id === updated.id) {
                    updateField(updated)
                  } else {
                    // ID changed? Should not happen usually unless replacing object
                    updateField(updated)
                  }
                  // Update local selection to reflect changes if needed
                  setSelectedField(updated)
                }}
                onDelete={(id) => {
                  if (confirm('Delete this field?')) {
                    deleteField(id)
                    setSelectedField(null) // Clear selection
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-[#999999]">
              <p>Select a field to configure</p>
            </div>
          )}
        </main>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              SQL Preview
            </DialogTitle>
            <DialogDescription>
              The following changes will be applied to the database.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-md bg-slate-950 p-4 font-mono text-sm text-slate-50">
            {previewOps.length > 0 ? (
              <pre className="whitespace-pre-wrap">{previewOps.join('\n')}</pre>
            ) : (
              <p className="italic text-slate-400">No changes detected.</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button
              className="bg-[#383838] text-white hover:bg-black"
              onClick={() => {
                setPreviewOpen(false)
                useModelStore.getState().publishModel()
              }}
            >
              Publish Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
