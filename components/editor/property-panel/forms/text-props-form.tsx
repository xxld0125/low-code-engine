'use client'

import { ComponentNode } from '@/types/editor'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEditorStore } from '@/stores/editor-store'
import { PropertyTextarea } from '../property-textarea'

interface TextPropsFormProps {
  component: ComponentNode
}

export function TextPropsForm({ component }: TextPropsFormProps) {
  const updateComponentProps = useEditorStore((state) => state.updateComponentProps)

  const handleChange = (key: string, value: unknown) => {
    updateComponentProps(component.id, { [key]: value })
  }

  const props = component.props as { content?: string; tag?: string }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text-tag" className="text-xs font-medium">
          HTML Tag
        </Label>
        <Select
          value={props.tag || 'p'}
          onValueChange={(value: string) => handleChange('tag', value)}
        >
          <SelectTrigger id="text-tag" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="h1">H1 (Heading 1)</SelectItem>
            <SelectItem value="h2">H2 (Heading 2)</SelectItem>
            <SelectItem value="h3">H3 (Heading 3)</SelectItem>
            <SelectItem value="p">P (Paragraph)</SelectItem>
            <SelectItem value="span">Span</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="text-content" className="text-xs font-medium">
          Content
        </Label>
        <PropertyTextarea
          id="text-content"
          placeholder="Enter text content or use {{expression}}"
          value={props.content || ''}
          onValueChange={(value) => handleChange('content', value)}
          className="mt-1.5 min-h-[80px] font-mono text-[13px]"
        />
        <p className="mt-1 text-[11px] text-gray-500">
          Supports template syntax:{' '}
          <code className="rounded bg-gray-100 px-1">{'{{user.name}}'}</code>
        </p>
      </div>
    </div>
  )
}
