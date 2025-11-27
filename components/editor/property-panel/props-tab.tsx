'use client'

import { ComponentNode, ComponentType } from '@/types/editor'
import { TextPropsForm } from './forms/text-props-form'
import { ButtonPropsForm } from './forms/button-props-form'
import { TablePropsForm } from './forms/table-props-form'
import { FormPropsForm } from './forms/form-props-form'
import { ContainerPropsForm } from './forms/container-props-form'

// Mapping component types to their respective form components
const FormRegistry: Partial<Record<ComponentType, React.FC<{ component: ComponentNode }>>> = {
  Text: TextPropsForm,
  Button: ButtonPropsForm,
  Table: TablePropsForm,
  Form: FormPropsForm,
  Container: ContainerPropsForm,
  Modal: ContainerPropsForm,
}

interface PropsTabProps {
  component: ComponentNode
}

export function PropsTab({ component }: PropsTabProps) {
  const FormComponent = FormRegistry[component.type]

  return (
    <div className="space-y-4 p-4">
      {/* Component Type Header */}
      <div className="mb-4">
        <div className="text-[11px] font-bold uppercase tracking-wide text-accent">
          {component.type} Properties
        </div>
        <div className="mt-1 font-mono text-[10px] text-gray-400">ID: {component.id}</div>
      </div>

      {/* Dynamic Form Based on Component Type */}
      {FormComponent ? (
        <FormComponent component={component} />
      ) : (
        <div className="text-xs text-gray-500">
          No properties configuration available for {component.type}.
        </div>
      )}
    </div>
  )
}
