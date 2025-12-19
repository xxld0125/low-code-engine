'use client'

import { useState } from 'react'
import { useModelStore } from '@/stores/useModelStore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus } from 'lucide-react'

export function CreateModelDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { createModel } = useModelStore()

  const [name, setName] = useState('')
  const [tableName, setTableName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !tableName) return

    setLoading(true)
    const success = await createModel(name, tableName, description)
    setLoading(false)

    if (success) {
      setOpen(false)
      setName('')
      setTableName('')
      setDescription('')
    }
  }

  // Auto-generate table name from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    if (!tableName) {
      setTableName(val.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button className="h-9 rounded-none bg-[#383838] px-4 text-[13px] font-semibold text-white hover:bg-black">
            <Plus className="mr-2 h-4 w-4" />
            New Model
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-none border-[1.5px] border-[#383838] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#383838]">
            Create Data Model
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Define a new data entity/table for your application.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-5 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-xs font-medium text-[#383838]">
              Model Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              className="col-span-3 h-9 rounded-none border-[1.5px] border-[#383838]/30 focus-visible:ring-[#16AA98]"
              placeholder="e.g. Sales Order"
              required
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tableName" className="text-right text-xs font-medium text-[#383838]">
              Table Name
            </Label>
            <Input
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="col-span-3 h-9 rounded-none border-[1.5px] border-[#383838]/30 font-mono text-xs focus-visible:ring-[#16AA98]"
              placeholder="e.g. sales_orders"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label
              htmlFor="description"
              className="mt-2 text-right text-xs font-medium text-[#383838]"
            >
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 h-9 rounded-none border-[1.5px] border-[#383838]/30 focus-visible:ring-[#16AA98]"
              placeholder="Optional description..."
            />
          </div>
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-none border-[#383838] text-[#383838] hover:bg-[#F4EFEA]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-none bg-[#383838] text-white hover:bg-[#383838]/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Model
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
