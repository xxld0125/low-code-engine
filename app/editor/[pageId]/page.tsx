import { createClient } from '@/lib/supabase/server'
import { EditorLayout } from '@/components/editor/editor-layout'
import { redirect } from 'next/navigation'
import { EditorInitializer } from '@/components/editor/editor-initializer'
import { ComponentNode } from '@/types/editor'

interface EditorPageProps {
  params: Promise<{
    pageId: string
  }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { pageId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  const { data: page, error } = await supabase.from('pages').select('*').eq('id', pageId).single()

  if (error || !page) {
    return <div>Page not found</div>
  }

  return (
    <>
      <EditorInitializer
        initialComponents={page.schema as unknown as Record<string, ComponentNode>}
      />
      <EditorLayout pageId={page.id} pageName={page.name} />
    </>
  )
}
