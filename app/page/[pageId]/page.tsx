'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PageService } from '@/lib/services/page-service'
import { useRuntimeStore } from '@/stores/runtime-store'
import { RuntimeRenderer } from '@/components/runtime/runtime-renderer'
import { ComponentNode } from '@/types/editor'

export default function RuntimePage() {
  const params = useParams()
  const pageId = params.pageId as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setPage = useRuntimeStore((state) => state.setPage)
  const rootId = useRuntimeStore((state) => state.rootId)

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true)
        const page = await PageService.getPage(pageId)

        if (page && page.schema) {
          // Parse schema
          const schema = page.schema as unknown as {
            rootId: string
            components: Record<string, ComponentNode>
          }
          setPage(schema.components, schema.rootId)
        } else {
          setError('Page has no content')
        }
      } catch (err) {
        console.error('Failed to load page:', err)
        setError('Failed to load page')
      } finally {
        setLoading(false)
      }
    }

    if (pageId) {
      loadPage()
    }
  }, [pageId, setPage])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-lg font-medium text-gray-500">Loading page...</div>
      </div>
    )
  }

  if (error || !rootId) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-lg font-medium text-red-500">{error || 'Page not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <RuntimeRenderer componentId={rootId} />
    </div>
  )
}
