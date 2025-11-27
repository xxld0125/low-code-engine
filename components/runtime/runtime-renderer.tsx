'use client'

import { useRuntimeStore } from '@/stores/runtime-store'
import { resolveProps } from '@/lib/runtime/expression-resolver'
import { useActionExecutor } from '@/lib/runtime/action-executor'
import { Container, Modal } from '@/components/renderer/layout-components'
import { Text, Button } from '@/components/renderer/basic-components'
import { RuntimeTable } from './runtime-table'
import { RuntimeForm } from './runtime-form'
import { CSSProperties } from 'react'
import { FormProvider, useFormContext } from './form-context'

interface PageRendererProps {
  componentId: string
}

export function RuntimeRenderer({ componentId }: PageRendererProps) {
  const component = useRuntimeStore((state) => state.components[componentId])
  const globalContext = useRuntimeStore((state) => state.globalContext)
  const openModals = useRuntimeStore((state) => state.openModals)
  const closeModal = useRuntimeStore((state) => state.closeModal)
  const { executeAction } = useActionExecutor()
  const { formId: currentFormId } = useFormContext()

  if (!component) return null

  // 1. Resolve Props & Style
  const resolvedProps = resolveProps(component.props, globalContext)
  const resolvedStyle = component.style as CSSProperties

  // 2. Handle Events
  const handleClick = async (e: React.MouseEvent) => {
    // Allow default behavior for form submit buttons if they are inside a form?
    // But here we are on a Button component.
    // If we have actions, we might want to stop propagation or prevent default depending on logic.
    // For now, let's just execute actions.
    if (component.actions && component.actions.length > 0) {
      const clickActions = component.actions.filter((a) => a.trigger === 'onClick')
      if (clickActions.length > 0) {
        e.stopPropagation()
        e.preventDefault() // Prevent default form submission or navigation
        for (const action of clickActions) {
          // Pass currentFormId to action executor so it can fallback to it if formId is missing
          await executeAction(action, { currentFormId })
        }
      }
    }
  }

  // 3. Recursive Children Rendering
  const renderChildren = () => {
    return component.children.map((childId) => (
      <RuntimeRenderer key={childId} componentId={childId} />
    ))
  }

  const commonProps = {
    style: resolvedStyle,
    className: 'relative box-border',
    ...resolvedProps,
  }

  switch (component.type) {
    case 'Container':
      return <Container {...commonProps}>{renderChildren()}</Container>
    case 'Modal':
      // Only render if open
      if (!openModals.includes(componentId)) return null
      return (
        <Modal {...commonProps} isOverlay={true}>
          {/* Close Button specific to Runtime Modal */}
          <div
            className="absolute right-4 top-4 cursor-pointer p-1 text-gray-400 transition-colors hover:text-[#383838]"
            onClick={() => closeModal(componentId)}
            title="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          {renderChildren()}
        </Modal>
      )
    case 'Text':
      return <Text {...commonProps} />
    case 'Button':
      return <Button {...commonProps} onClick={handleClick} />
    case 'Table':
      return <RuntimeTable componentId={componentId} {...commonProps} />
    case 'Form':
      // Form passes children through to be rendered inside the form tag
      // WRAP with FormProvider so children know they are in this form
      return (
        <FormProvider value={{ formId: componentId }}>
          <RuntimeForm componentId={componentId} actions={component.actions} {...commonProps}>
            {renderChildren()}
          </RuntimeForm>
        </FormProvider>
      )
    default:
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="border border-dashed border-red-500 bg-red-50 p-2 text-xs text-red-500">
            Unknown Component: {component.type}
          </div>
        )
      }
      return null
  }
}
