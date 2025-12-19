import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server' // Use User Context Client
import { generateSchemaDiff } from '@/lib/schema-diff'
import { DataModel, FieldType, ValidationRules } from '@/types/data-engine'

// NOTE: Ideally we should use a Service Role client for DDL to ensure we can bypass RLS.
// However, since the Service Key is missing in the environment, we fall back to using
// the Authenticated User's client. This requires the user to have adequate permissions
// (e.g., RLS policies on _sys_fields and DDL rights via RPC).

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient() // Authenticated user client
  const body = await request.json()
  const newModel = body.model as DataModel

  if (!newModel) {
    return NextResponse.json({ error: 'Invalid model data' }, { status: 400 })
  }

  try {
    // 1. Fetch current (old) model from DB
    // We assume _sys_models stores the metadata.
    // NOTE: In Phase 0.3, we defined _sys_models.

    // Fetch Model Metadata
    const { data: oldModelMeta } = await supabase
      .from('_sys_models')
      .select('*')
      .eq('id', id)
      .single()

    // Fetch Fields
    const { data: oldFields } = await supabase.from('_sys_fields').select('*').eq('model_id', id)

    let oldModel: DataModel | undefined = undefined

    if (oldModelMeta) {
      oldModel = {
        ...oldModelMeta,
        fields: (oldFields || []).map((f: unknown) => {
          const field = f as Record<string, unknown>
          return {
            id: field.id as string,
            name: field.name as string,
            key: field.key as string,
            type: field.type as FieldType,
            description: field.description as string,
            validation: (field.config as Record<string, unknown> | undefined)?.validation as
              | ValidationRules
              | undefined,
          }
        }),
      } as DataModel
    }

    // 2. Check Physical Table Existence
    // Even if _sys_models metadata exists, the physical table might typically be missing
    // (e.g. initial creation drift). We verify by trying to select from it using raw SQL.
    // If table doesn't exist, Postgres will throw a 42P01 error from the RPC.
    const { error: tableCheckError } = await supabase.rpc('exec_sql', {
      sql_query: `SELECT 1 FROM "${newModel.table_name}" LIMIT 1`,
    })

    console.log('DEBUG: Table Check RPC', newModel.table_name, tableCheckError)

    const physicalTableMissing =
      tableCheckError &&
      (tableCheckError.code === '42P01' ||
        (tableCheckError.message && tableCheckError.message.includes('does not exist')))

    // 3. Generate Diff
    // If physical table is missing, we must ignore 'oldModel' metadata and force a full CREATE TABLE.
    const ops = generateSchemaDiff(newModel, physicalTableMissing ? undefined : oldModel)

    console.log('DEBUG: Generated Ops', ops)

    // Check for destructive changes
    const destructive = ops.some((op) => op.toUpperCase().includes('DROP COLUMN'))

    const { dryRun } = body

    if (dryRun) {
      return NextResponse.json({
        success: true,
        ops,
        destructive,
        message: destructive
          ? 'Warning: This update includes destructive changes (DROP COLUMN).'
          : 'Safe to update.',
      })
    }

    // 3. Execute DDL via RPC
    if (ops.length > 0) {
      const sql = ops.join('\n')
      const { error: rpcError } = await supabase.rpc('exec_sql', { sql_query: sql })
      if (rpcError) throw rpcError
    }

    // 4. Update Metadata (_sys_tables)
    // Update Model
    await supabase.from('_sys_models').upsert({
      id: newModel.id,
      name: newModel.name,
      table_name: newModel.table_name,
      description: newModel.description,
      updated_at: new Date().toISOString(),
    })

    // Update Fields (Full Sync: Delete missing, Upsert others)
    // 4.1 Delete removed fields - Robust Approach
    const { data: existingFieldsData } = await supabase
      .from('_sys_fields')
      .select('id')
      .eq('model_id', id)

    const existingIds = (existingFieldsData || []).map((f: { id: string }) => f.id)
    const newFieldIds = newModel.fields.map((f) => f.id)

    // Find IDs that are in DB but NOT in the new payload
    const idsToDelete = existingIds.filter((dbId) => !newFieldIds.includes(dbId))

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('_sys_fields')
        .delete()
        .eq('model_id', id) // Extra safety
        .in('id', idsToDelete)

      if (deleteError) {
        console.error('Delete fields error:', deleteError)
        throw deleteError
      }
    }

    // 4.2 Upsert fields
    const fieldsRows = newModel.fields.map((f) => ({
      id: f.id,
      model_id: id,
      name: f.name,
      key: f.key,
      type: f.type,
      description: f.description,
      is_system: f.isSystem || false,
      config: {
        validation: f.validation,
        options: f.options,
        relation: f.relation,
        defaultValue: f.defaultValue,
      },
      updated_at: new Date().toISOString(),
    }))

    if (fieldsRows.length > 0) {
      const { error: fieldsUpsertError } = await supabase.from('_sys_fields').upsert(fieldsRows)
      if (fieldsUpsertError) throw fieldsUpsertError
    }

    return NextResponse.json({ success: true, ops })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Publish Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
