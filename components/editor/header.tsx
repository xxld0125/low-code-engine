'use client'

import Link from 'next/link'
import { Eye, Save, Undo, Redo, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/stores/editor-store'
import { PageService } from '@/lib/services/page-service'
import { toast } from 'sonner'
import { useState } from 'react'

interface EditorHeaderProps {
  pageId: string
  pageName: string
}

export function EditorHeader({ pageId, pageName }: EditorHeaderProps) {
  const { components } = useEditorStore()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // We need to pass the dictionary of components directly
      await PageService.updatePageSchema(pageId, components)
      toast.success('Page saved successfully')
    } catch (error) {
      console.error('Failed to save page', error)
      toast.error('Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    window.open(`/page/${pageId}`, '_blank')
  }

  return (
    <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-[#383838] bg-white px-6">
      <div className="flex items-center gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 text-lg font-bold text-[#383838] no-underline hover:opacity-80"
        >
          <div className="h-7 w-7 border-2 border-[#383838] bg-[#16AA98]" />
          LOWCODE
        </Link>
        <div className="h-6 w-[2px] bg-[#e0e0e0]" />
        <div className="flex items-center gap-2 text-sm">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-40">/</span>
          <span className="font-semibold">{pageName}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded border border-[#e0e0e0] bg-[#f5f5f5] p-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled
          title="Undo (Not implemented)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled
          title="Redo (Not implemented)"
        >
          <Redo className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-4 w-[1px] bg-[#ccc]" />
        <div className="flex items-center gap-1 px-2 text-xs text-[#888]">
          <Monitor className="h-3 w-3" />
          Desktop Mode (1280px+)
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-9 rounded-none border-0 bg-[#16AA98] text-white transition-all hover:bg-[#139685] hover:shadow-[2px_2px_0px_#383838] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          variant="outline"
          onClick={handlePreview}
          className="h-9 rounded-none border-[1.5px] border-[#383838] bg-white text-[#383838] hover:bg-[#f0f0f0]"
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
      </div>
    </header>
  )
}
