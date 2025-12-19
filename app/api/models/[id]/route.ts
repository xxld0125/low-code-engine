import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  try {
    // 1. Fetch model metadata to get table name
    const { data: model, error: fetchError } = await supabase
      .from('_sys_models')
      .select('table_name')
      .eq('id', id)
      .single()

    if (fetchError || !model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    // 2. Drop physical table (CASCADE to handle foreign keys)
    const dropTableSQL = `DROP TABLE IF EXISTS "${model.table_name}" CASCADE;`
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql_query: dropTableSQL,
    })

    if (dropError) {
      console.error('Drop table error:', dropError)
      throw dropError
    }

    // 3. Delete metadata (fields will be cascaded automatically via FK)
    const { error: deleteError } = await supabase.from('_sys_models').delete().eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: `Model "${model.table_name}" deleted successfully.`,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Delete Model Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
