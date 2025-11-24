import { createClient } from '@/lib/supabase/client'
import { Database, Json } from '@/types/supabase'

export type Page = Database['public']['Tables']['pages']['Row']
export type PageInsert = Database['public']['Tables']['pages']['Insert']
export type PageUpdate = Database['public']['Tables']['pages']['Update']

export class PageService {
  private static supabase = createClient()

  static async getPages() {
    const { data, error } = await this.supabase
      .from('pages')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async getPage(id: string) {
    const { data, error } = await this.supabase.from('pages').select('*').eq('id', id).single()

    if (error) throw error
    return data
  }

  static async createPage(page: PageInsert) {
    const { data, error } = await this.supabase.from('pages').insert(page).select().single()

    if (error) throw error
    return data
  }

  static async updatePageSchema(id: string, schema: Json) {
    const { data, error } = await this.supabase
      .from('pages')
      .update({ schema, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deletePage(id: string) {
    const { error } = await this.supabase.from('pages').delete().eq('id', id)

    if (error) throw error
  }
}
