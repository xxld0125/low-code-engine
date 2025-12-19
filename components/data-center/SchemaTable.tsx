'use client'

import { Field } from '@/types/data-engine'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Settings2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SchemaTableProps {
  fields: Field[]
  onEditField: (field: Field) => void
  onDeleteField: (field: Field) => void
}

export function SchemaTable({ fields, onEditField, onDeleteField }: SchemaTableProps) {
  if (fields.length === 0) {
    return (
      <div className="rounded-md border border-dashed bg-muted/10 p-8 text-center text-muted-foreground">
        No fields defined yet. Add a field to start.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Field Name</TableHead>
            <TableHead className="w-[180px]">Key</TableHead>
            <TableHead className="w-[120px]">Type</TableHead>
            <TableHead>Attributes</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field) => (
            <TableRow key={field.id} className="group">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {field.isSystem && <Settings2 className="h-3 w-3 text-muted-foreground" />}
                  {field.name}
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5">{field.key}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="font-normal capitalize">
                    {field.type}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {field.validation?.required && (
                    <Badge
                      variant="outline"
                      className="h-5 border-red-200 bg-red-50 text-[10px] text-red-700"
                    >
                      Required
                    </Badge>
                  )}
                  {field.validation?.unique && (
                    <Badge
                      variant="outline"
                      className="h-5 border-blue-200 bg-blue-50 text-[10px] text-blue-700"
                    >
                      Unique
                    </Badge>
                  )}
                  {field.isSystem && (
                    <Badge variant="outline" className="h-5 text-[10px]">
                      System
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {!field.isSystem && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditField(field)}>
                        Edit Configuration
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDeleteField(field)}
                      >
                        Delete Field
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
