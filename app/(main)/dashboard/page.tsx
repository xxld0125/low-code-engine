'use client'

import { useEffect, useState } from 'react'
import { PageService, Page } from '@/lib/services/page-service'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Trash2, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
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
import { Textarea } from '@/components/ui/textarea'

export default function DashboardPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const router = useRouter()

  useEffect(() => {
    loadPages()
  }, [])

  async function loadPages() {
    try {
      const data = await PageService.getPages()
      setPages(data || [])
    } catch (error) {
      console.error('Failed to load pages:', error)
      toast.error('Failed to load pages')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePage(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Page name is required')
      return
    }

    setCreating(true)
    try {
      const newPage = await PageService.createPage({
        name: formData.name,
        description: formData.description,
        slug: `page-${crypto.randomUUID()}`, // Auto-generate slug with prefix
        schema: {},
      })
      toast.success('Page created')
      setOpen(false)
      router.push(`/editor/${newPage.id}`)
    } catch (error) {
      console.error('Failed to create page:', error)
      toast.error('Failed to create page')
    } finally {
      setCreating(false)
    }
  }

  async function handleDeletePage(id: string, e: React.MouseEvent) {
    e.preventDefault() // Prevent navigation if button is inside a link
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      await PageService.deletePage(id)
      setPages(pages.filter((p) => p.id !== id))
      toast.success('Page deleted')
    } catch (error) {
      console.error('Failed to delete page:', error)
      toast.error('Failed to delete page')
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Pages</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
              <DialogDescription>Enter the details for your new page.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePage}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., User Management"
                    autoFocus
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the page..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Page
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {pages.length === 0 ? (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
          <FileText className="mb-4 h-10 w-10 opacity-50" />
          <p className="mb-4 text-sm">No pages created yet.</p>
          <Button variant="outline" onClick={() => setOpen(true)}>
            Create your first page
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/editor/${page.id}`}
              className="group relative flex flex-col justify-between rounded-lg border p-6 transition-colors hover:border-accent hover:bg-accent/5"
            >
              <div className="space-y-2">
                <h3 className="font-semibold leading-none tracking-tight">{page.name}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {page.description || 'No description'}
                </p>
                <p className="mt-2 truncate font-mono text-xs text-muted-foreground">{page.slug}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(page.updated_at).toLocaleDateString()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  onClick={(e) => handleDeletePage(page.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
