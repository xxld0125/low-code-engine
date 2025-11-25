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
import { PropertyInput } from './property-input'

interface StyleTabProps {
  component: ComponentNode
}

export function StyleTab({ component }: StyleTabProps) {
  const updateComponentStyle = useEditorStore((state) => state.updateComponentStyle)

  const handleStyleChange = (key: string, value: string) => {
    updateComponentStyle(component.id, { [key]: value })
  }

  const showDisplayConfig = component.type === 'Container'

  return (
    <div className="space-y-6 p-4">
      {/* Layout Section */}
      <div>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-accent">Layout</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="width" className="text-xs">
              Width
            </Label>
            <PropertyInput
              id="width"
              placeholder="e.g., 100%, 500px, auto"
              value={component.style?.width || ''}
              onValueChange={(value) => handleStyleChange('width', value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-xs">
              Height
            </Label>
            <PropertyInput
              id="height"
              placeholder="e.g., auto, 100%, 300px"
              value={component.style?.height || ''}
              onValueChange={(value) => handleStyleChange('height', value)}
              className="mt-1.5"
            />
          </div>
          {showDisplayConfig && (
            <div>
              <Label htmlFor="display" className="text-xs">
                Display
              </Label>
              <Select
                value={component.style?.display || 'block'}
                onValueChange={(value: string) => handleStyleChange('display', value)}
              >
                <SelectTrigger id="display" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Block</SelectItem>
                  <SelectItem value="flex">Flex</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Spacing Section */}
      <div>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-accent">Spacing</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="margin" className="text-xs">
              Margin
            </Label>
            <PropertyInput
              id="margin"
              placeholder="e.g., 16px, 8px 16px"
              value={component.style?.margin || ''}
              onValueChange={(value) => handleStyleChange('margin', value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="padding" className="text-xs">
              Padding
            </Label>
            <PropertyInput
              id="padding"
              placeholder="e.g., 16px, 8px 16px"
              value={component.style?.padding || ''}
              onValueChange={(value) => handleStyleChange('padding', value)}
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Flex/Grid Properties (conditional) */}
      {component.style?.display === 'flex' && (
        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-accent">
            Flexbox
          </h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="justifyContent" className="text-xs">
                Justify Content
              </Label>
              <Select
                value={component.style?.justifyContent || 'flex-start'}
                onValueChange={(value: string) => handleStyleChange('justifyContent', value)}
              >
                <SelectTrigger id="justifyContent" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flex-start">Flex Start</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="flex-end">Flex End</SelectItem>
                  <SelectItem value="space-between">Space Between</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="alignItems" className="text-xs">
                Align Items
              </Label>
              <Select
                value={component.style?.alignItems || 'flex-start'}
                onValueChange={(value: string) => handleStyleChange('alignItems', value)}
              >
                <SelectTrigger id="alignItems" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flex-start">Flex Start</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="flex-end">Flex End</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gap" className="text-xs">
                Gap
              </Label>
              <PropertyInput
                id="gap"
                placeholder="e.g., 8px, 16px"
                value={component.style?.gap || ''}
                onValueChange={(value) => handleStyleChange('gap', value)}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
