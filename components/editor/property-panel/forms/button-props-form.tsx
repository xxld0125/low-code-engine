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
import { Checkbox } from '@/components/ui/checkbox'
import { useEditorStore } from '@/stores/editor-store'
import { PropertyInput } from '../property-input'

interface ButtonPropsFormProps {
  component: ComponentNode
}

export function ButtonPropsForm({ component }: ButtonPropsFormProps) {
  const updateComponentProps = useEditorStore((state) => state.updateComponentProps)

  const handleChange = (key: string, value: unknown) => {
    updateComponentProps(component.id, { [key]: value })
  }

  const props = component.props as {
    label?: string
    variant?: string
    size?: string
    disabled?: boolean
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="button-text" className="text-xs font-medium">
          Button Text
        </Label>
        <PropertyInput
          id="button-text"
          placeholder="Click Me"
          value={props.label || ''}
          onValueChange={(value) => handleChange('label', value)}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="button-variant" className="text-xs font-medium">
          Variant
        </Label>
        <Select
          value={props.variant || 'default'}
          onValueChange={(value: string) => handleChange('variant', value)}
        >
          <SelectTrigger id="button-variant" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="destructive">Destructive</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="secondary">Secondary</SelectItem>
            <SelectItem value="ghost">Ghost</SelectItem>
            <SelectItem value="link">Link</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="button-size" className="text-xs font-medium">
          Size
        </Label>
        <Select
          value={props.size || 'default'}
          onValueChange={(value: string) => handleChange('size', value)}
        >
          <SelectTrigger id="button-size" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
            <SelectItem value="icon">Icon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="button-disabled"
          checked={props.disabled || false}
          onCheckedChange={(checked) => handleChange('disabled', checked)}
        />
        <Label htmlFor="button-disabled" className="text-xs font-medium">
          Disabled
        </Label>
      </div>
    </div>
  )
}
