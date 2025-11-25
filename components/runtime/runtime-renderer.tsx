'use client'

import { useRuntimeStore } from '@/stores/runtime-store'
import { resolveProps } from '@/lib/runtime/expression-resolver'
import { useActionExecutor } from '@/lib/runtime/action-executor'
import { Container, Modal } from '@/components/renderer/layout-components'
import { Text, Button } from '@/components/renderer/basic-components'
import { RuntimeTable } from './runtime-table'
import { RuntimeForm } from './runtime-form'
import { CSSProperties } from 'react'

interface PageRendererProps {
  componentId: string
}

export function RuntimeRenderer({ componentId }: PageRendererProps) {
  const component = useRuntimeStore((state) => state.components[componentId])
  const globalContext = useRuntimeStore((state) => state.globalContext)
  const openModals = useRuntimeStore((state) => state.openModals)
  const closeModal = useRuntimeStore((state) => state.closeModal)
  const { executeAction } = useActionExecutor()

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
    if (component.actions) {
      e.stopPropagation()
      const clickActions = component.actions.filter((a) => a.trigger === 'onClick')
      for (const action of clickActions) {
        await executeAction(action)
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
        <Modal {...commonProps}>
          {renderChildren()}
          <div
            className="absolute right-2 top-2 cursor-pointer font-bold text-gray-500 hover:text-gray-700"
            onClick={() => closeModal(componentId)}
          >
            ✕
          </div>
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
      return (
        <RuntimeForm componentId={componentId} actions={component.actions} {...commonProps}>
          {renderChildren()}
        </RuntimeForm>
      )
    default:
      return null
  }
}
