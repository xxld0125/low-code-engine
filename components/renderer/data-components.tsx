import { forwardRef, CSSProperties, ReactNode, HTMLAttributes, FormHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import {
  Table as UiTable,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Inbox } from 'lucide-react'

interface BaseProps extends HTMLAttributes<HTMLDivElement> {
  style?: CSSProperties
  className?: string
}

export interface TableProps extends BaseProps {
  tableName?: string
  columns?: Array<{ accessorKey?: string; field?: string; header: string }>
  data?: Record<string, unknown>[]
  isRuntime?: boolean
  isEmpty?: boolean
}

export const Table = forwardRef<HTMLDivElement, TableProps>(
  ({ tableName, columns, data, isRuntime, isEmpty, style, className, children, ...props }, ref) => {
    // Normalize columns to ensure accessorKey exists (support 'field' from editor)
    const normalizedColumns = columns?.map((col) => ({
      ...col,
      accessorKey: col.accessorKey || col.field || '',
    }))

    // Mock data if not provided and not in runtime mode
    const mockColumns = normalizedColumns || [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'created_at', header: 'Created At' },
    ]

    // In runtime mode, use actual data; in editor mode, use mock data for preview
    const displayData = isRuntime
      ? data || []
      : data || [
          { id: 1, name: 'Sample Row 1', created_at: '2023-01-01' },
          { id: 2, name: 'Sample Row 2', created_at: '2023-01-02' },
          { id: 3, name: 'Sample Row 3', created_at: '2023-01-03' },
        ]

    // Show empty state only in runtime mode when data is empty
    const showEmptyState = isRuntime && isEmpty

    return (
      <div ref={ref} className={cn('relative', className)} style={style} {...props}>
        {children}
        {/* Table Container */}
        <div className="w-full overflow-auto border border-[#383838] bg-white">
          {/* Table Title Panel */}
          <div className="border-b border-[#383838] bg-[#F4EFEA] px-4 py-2 text-xs font-bold uppercase text-[#383838]">
            {tableName || 'Table Component'}
          </div>
          <UiTable>
            <TableHeader>
              {/* Admin Style: Header Height 40px, Border #383838 */}
              <TableRow className="border-b border-[#383838] hover:bg-transparent">
                {mockColumns.map((col) => (
                  <TableHead
                    key={col.accessorKey}
                    // Admin Style: 13px text, #383838
                    className="h-10 text-[13px] font-bold text-[#383838]"
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {showEmptyState ? (
                <TableRow>
                  <TableCell colSpan={mockColumns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                      <Inbox className="h-10 w-10" />
                      <span className="text-sm">暂无数据</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((row, i) => (
                  // Admin Style: Row border #383838 (Strict Mode)
                  <TableRow key={i} className="border-b border-[#383838] hover:bg-[#16AA98]/5">
                    {mockColumns.map((col) => {
                      const cellValue = row[col.accessorKey]
                      let displayValue = cellValue as ReactNode

                      // Handle boolean values specifically
                      if (typeof cellValue === 'boolean') {
                        displayValue = String(cellValue) // "true" or "false"
                      } else if (cellValue === null || cellValue === undefined) {
                        displayValue = ''
                      }

                      return (
                        <TableCell
                          key={`${i}-${col.accessorKey}`}
                          className="py-2 text-[13px] text-[#383838]"
                        >
                          {displayValue}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </UiTable>
        </div>
      </div>
    )
  }
)
Table.displayName = 'Table'

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  tableName?: string
  fields?: Array<{ name: string; label: string; type: string; required?: boolean }>
  children?: ReactNode
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ tableName, fields, style, className, children, ...props }, ref) => {
    const hasFields = fields && fields.length > 0
    const mockFields = !hasFields
      ? [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
        ]
      : fields

    return (
      <form
        ref={ref}
        className={cn('w-full space-y-4 border border-[#383838] bg-white p-5', className)}
        style={style}
        {...props}
      >
        {tableName && (
          <div className="mb-4 text-sm font-bold uppercase text-[#383838]">{tableName} Form</div>
        )}
        <div className="grid gap-4">
          {(mockFields || []).map((field) => (
            <div key={field.name} className="space-y-1.5">
              {/* Admin Style: Label 12px */}
              <Label className="text-[12px] font-medium text-[#383838]">
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
              </Label>
              {/* Admin Style: Input Border #383838 is handled in Input component or verify below */}
              <Input
                name={field.name}
                placeholder={`Enter ${field.label}`}
                type={field.type}
                required={field.required}
                className="border-[#383838]"
              />
            </div>
          ))}
        </div>

        {children && <div className="mt-4 flex flex-wrap items-center gap-2">{children}</div>}
      </form>
    )
  }
)
Form.displayName = 'Form'
