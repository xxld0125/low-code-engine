'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { PageService } from '@/lib/services/page-service'
import { useRuntimeStore } from '@/stores/runtime-store'
import { RuntimeRenderer } from '@/components/runtime/runtime-renderer'
import { PageSchema } from '@/lib/schema/page-schema'
import { createClient } from '@/lib/supabase/client'
import { ComponentNode } from '@/types/editor'

function RuntimePageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const pageId = params.pageId as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setPage = useRuntimeStore((state) => state.setPage)
  const setGlobalContext = useRuntimeStore((state) => state.setGlobalContext)
  const rootId = useRuntimeStore((state) => state.rootId)

  useEffect(() => {
    async function initRuntime() {
      try {
        setLoading(true)

        // 1. Fetch Page & User in parallel
        const supabase = createClient()
        const [
          page,
          {
            data: { user },
          },
        ] = await Promise.all([PageService.getPage(pageId), supabase.auth.getUser()])

        // 2. Validate & Set Page
        if (page && page.schema) {
          console.log('=== Runtime: Loading schema ===')
          console.log('Raw schema:', page.schema)
          console.log('Schema type:', typeof page.schema)

          const parseResult = PageSchema.safeParse(page.schema)

          if (parseResult.success) {
            const { components, rootId } = parseResult.data
            setPage(components as Record<string, ComponentNode>, rootId)

            // 3. Set Context (User + Params + SearchParams)
            const searchParamsObj = Object.fromEntries(searchParams.entries())
            setGlobalContext({
              user: user || null,
              params: params,
              searchParams: searchParamsObj,
            })
          } else {
            console.error('Schema validation failed:', parseResult.error)
            setError(
              'Invalid page schema. Please save the page in the editor to update it to the new format.'
            )
          }
        } else {
          setError('Page has no content. Please edit the page and save it first.')
        }
      } catch (err) {
        console.error('Failed to load page:', err)
        setError('Failed to load page')
      } finally {
        setLoading(false)
      }
    }

    if (pageId) {
      initRuntime()
    }
  }, [pageId, setPage, setGlobalContext, params, searchParams])

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

export default function RuntimePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-lg font-medium text-gray-500">Loading page...</div>
        </div>
      }
    >
      <RuntimePageContent />
    </Suspense>
  )
}
