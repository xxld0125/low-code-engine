'use client'

import { ComponentNode } from '@/types/editor'

interface ContainerPropsFormProps {
  component: ComponentNode
}

export function ContainerPropsForm({ component }: ContainerPropsFormProps) {
  return (
    <div className="space-y-4">
      <div className="rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
        <p className="font-medium">
          Container components ({component.type}) primarily use the Style tab for configuration.
        </p>
        <p className="mt-1">Use the STYLE tab to configure layout, spacing, and alignment.</p>
      </div>
    </div>
  )
}
