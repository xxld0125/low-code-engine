export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      pages: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          slug: string
          schema: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          description?: string | null
          slug: string
          schema?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          path?: string
          schema?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pages_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
      get_columns: {
        Args: {
          table_name_param: string
        }
        Returns: {
          column_name: string
          data_type: string
          is_nullable: boolean
          is_primary_key: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
