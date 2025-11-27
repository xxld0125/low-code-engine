import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tableName = searchParams.get('tableName')

  if (!tableName) {
    return NextResponse.json({ error: 'Table name is required' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    // Note: Direct access to information_schema might be restricted by RLS or role permissions
    // But usually authenticated users can read it for their own tables.
    // However, Supabase JS client doesn't support querying information_schema directly easily via .from()
    // unless we expose it.
    // The previous SchemaService used an RPC call 'get_columns'.
    // Let's check if that RPC exists or implement a direct query if possible.

    // Let's try to use the RPC if it was intended to be used.
    const { data, error } = await supabase.rpc('get_columns', { table_name_param: tableName })

    if (error) {
      console.error('RPC get_columns failed:', error)
      // Fallback strategy: try to select one row and infer types? No, that's not accurate for schema.
      // Let's return error for now, as the user might need to run the SQL to create the function.
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error fetching columns:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
