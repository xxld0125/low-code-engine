import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface UseDataQueryOptions {
  select?: string
  filters?: Record<string, unknown> // Simple equality filters for now
  limit?: number
  enabled?: boolean
}

export function useDataQuery<T = unknown>(tableName: string, options: UseDataQueryOptions = {}) {
  const { select = '*', filters = {}, limit = 100, enabled = true } = options
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled || !tableName) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        let query = supabase.from(tableName).select(select)

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        })

        if (limit) {
          query = query.limit(limit)
        }

        const { data: result, error: queryError } = await query

        if (queryError) throw queryError
        setData(result as T[])
      } catch (err: unknown) {
        const error = err as Error
        console.error(`Error fetching data from ${tableName}:`, error)
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName, JSON.stringify(filters), select, limit, enabled])

  return { data, loading, error }
}
