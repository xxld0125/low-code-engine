'use client'

import { useEffect, useState } from 'react'
import { useModelStore } from '@/stores/useModelStore'
import Link from 'next/link'
import { Database, Loader2, MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { CreateModelDialog } from './CreateModelDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function ModelList() {
  const { models, fetchModels, deleteModel, loading } = useModelStore()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [modelToDelete, setModelToDelete] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  const handleDeleteClick = (e: React.MouseEvent, modelId: string, modelName: string) => {
    e.stopPropagation()
    setModelToDelete({ id: modelId, name: modelName })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!modelToDelete) return

    const success = await deleteModel(modelToDelete.id)
    if (success) {
      setDeleteDialogOpen(false)
      setModelToDelete(null)
    }
  }

  if (loading && models.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Define the grid layout class
  const gridClass = 'grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6'

  const NewModelCard = () => (
    <CreateModelDialog
      trigger={
        <div className="group flex h-[160px] cursor-pointer flex-col items-center justify-center rounded-none border border-dashed text-muted-foreground transition-colors hover:border-accent hover:bg-accent/5">
          <div className="mb-2 transition-colors group-hover:text-accent">
            <Plus className="h-6 w-6" />
          </div>
          <div className="text-[13px] font-medium transition-colors group-hover:text-accent">
            Create Model
          </div>
        </div>
      }
    />
  )

  return (
    <>
      <div className={gridClass}>
        {models.map((model) => (
          <Link key={model.id} href={`/data-center/model-editor/${model.id}`} className="block">
            <div className="group relative flex h-[160px] cursor-pointer flex-col border bg-card p-5 text-card-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-[4px_4px_0px_rgba(22,170,152,0.1)]">
              {/* Card Header: Icon + Menu */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-8 w-8 items-center justify-center bg-accent/10 text-accent">
                  <Database className="h-4 w-4" strokeWidth={2} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                    <div className="rounded-sm p-1 text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={(e) => handleDeleteClick(e, model.id, model.name)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Model
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Content: Name + Code */}
              <div>
                <div className="mb-1 text-[16px] font-semibold leading-tight">{model.name}</div>
                <div className="font-mono text-[12px] text-muted-foreground">
                  {model.table_name}
                </div>
              </div>

              {/* Footer: Tags */}
              <div className="mt-auto flex gap-2">
                <div className="flex items-center bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                  {model.fields?.length || 0} Fields
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Always show "Create New" card at the end */}
        <NewModelCard />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                Are you sure you want to delete <strong>{modelToDelete?.name}</strong>?
                <br />
                <br />
                This will permanently delete:
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>The physical database table</li>
                  <li>All model metadata and field configurations</li>
                  <li>All existing data in this table</li>
                </ul>
                <br />
                <span className="font-semibold text-red-600">This action cannot be undone.</span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
