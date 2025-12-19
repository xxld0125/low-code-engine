import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const deletedModels = []
  const errors = []

  try {
    // 1. Fetch all models
    const { data: models, error: fetchError } = await supabase
      .from('_sys_models')
      .select('id, name, table_name')

    if (fetchError) throw fetchError

    if (!models) {
      return NextResponse.json({ success: true, message: 'No models found' })
    }

    // 2. Filter models to delete (Keep 'Customer2')
    const modelsToDelete = models.filter((m) => m.name !== 'Customer2')

    // 3. Iterate and delete
    for (const model of modelsToDelete) {
      try {
        // Drop Physical Table
        const dropTableSQL = `DROP TABLE IF EXISTS "${model.table_name}" CASCADE;`
        const { error: dropError } = await supabase.rpc('exec_sql', {
          sql_query: dropTableSQL,
        })

        if (dropError) {
          console.error(`Failed to drop table ${model.table_name}:`, dropError)
          errors.push({ model: model.name, error: dropError.message })
          // Continue to try deleting metadata even if drop fails (might be out of sync)
        }

        // Delete Metadata
        const { error: deleteError } = await supabase
          .from('_sys_models')
          .delete()
          .eq('id', model.id)

        if (deleteError) {
          throw deleteError
        }

        deletedModels.push(model.name)
      } catch (err: unknown) {
        const error = err as Error
        console.error(`Error deleting model ${model.name}:`, error)
        errors.push({ model: model.name, error: error.message })
      }
    }

    return NextResponse.json({
      success: true,
      deleted: deletedModels,
      kept: models.find((m) => m.name === 'Customer2') ? 'Customer2' : 'Not Found',
      errors,
    })
  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
