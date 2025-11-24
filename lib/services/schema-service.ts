import { createClient } from '@/lib/supabase/client'

export class SchemaService {
  private static supabase = createClient()

  static async getTables() {
    const { data, error } = await this.supabase.rpc('get_tables')
    if (error) throw error
    return data
  }

  static async getTableColumns(tableName: string) {
    const { data, error } = await this.supabase.rpc('get_columns', { table_name_param: tableName })
    if (error) throw error
    return data
  }
}
