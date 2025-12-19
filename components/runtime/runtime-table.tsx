'use client'

import { useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DataService } from '@/lib/services/data-service'
import { Table, TableProps } from '@/components/renderer/data-components'

interface RuntimeTableProps extends TableProps {
  componentId: string
}

export function RuntimeTable({ componentId, tableName, ...props }: RuntimeTableProps) {
  const queryClient = useQueryClient()
  const queryKey = useMemo(() => ['table-data', tableName], [tableName])

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!tableName) return []
      return await DataService.fetchTableData(tableName)
    },
    enabled: !!tableName,
  })

  useEffect(() => {
    const handleRefresh = () => {
      console.log('Refreshing table:', tableName)
      queryClient.invalidateQueries({ queryKey })
    }

    // Listen to the specific event for this table (using ID would be better if we passed it in payload)
    // The ActionExecutor dispatches `table:refresh:${tableId}`.
    // But wait, the action payload has `tableId`, which usually refers to the COMPONENT ID of the table,
    // not the database table name.
    // So we should listen to `table:refresh:${componentId}`.

    const eventName = `table:refresh:${componentId}`
    window.addEventListener(eventName, handleRefresh)

    return () => {
      window.removeEventListener(eventName, handleRefresh)
    }
  }, [componentId, queryClient, queryKey, tableName])

  if (error) {
    return <div className="text-red-500">Error loading data: {(error as Error).message}</div>
  }

  // Transform editor columns (field) to Table columns (accessorKey)
  const tableColumns = props.columns?.map((col) => ({
    accessorKey: col.field,
    header: col.header,
  }))

  // Check if data is empty (runtime mode)
  const isEmpty = !isLoading && (!data || data.length === 0)

  return (
    <Table
      tableName={tableName}
      {...props}
      columns={tableColumns}
      data={data as Record<string, unknown>[]}
      className={isLoading ? 'opacity-50' : ''}
      isRuntime={true}
      isEmpty={isEmpty}
    />
  )
}
