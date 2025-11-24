import { createClient } from '@/lib/supabase/client'

export class DataService {
  private static supabase = createClient()

  static async fetchTableData(tableName: string) {
    const { data, error } = await this.supabase.from(tableName).select('*')

    if (error) throw error
    return data
  }

  static async insertRecord(tableName: string, record: Record<string, unknown>) {
    const { data, error } = await this.supabase.from(tableName).insert(record).select().single()

    if (error) throw error
    return data
  }

  static async updateRecord(
    tableName: string,
    id: string | number,
    record: Record<string, unknown>
  ) {
    const { data, error } = await this.supabase
      .from(tableName)
      .update(record)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteRecord(tableName: string, id: string | number) {
    const { error } = await this.supabase.from(tableName).delete().eq('id', id)

    if (error) throw error
  }
}
