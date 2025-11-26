'use client'

import { useEditorStore } from '@/stores/editor-store'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Container, Modal } from '@/components/renderer/layout-components'
import { Text, Button } from '@/components/renderer/basic-components'
import { Table, Form } from '@/components/renderer/data-components'
import { CSSProperties } from 'react'
import { X } from 'lucide-react'

interface ComponentRendererProps {
  componentId: string
}

export function ComponentRenderer({ componentId }: ComponentRendererProps) {
  const component = useEditorStore((state) => state.components[componentId])
  const selectedId = useEditorStore((state) => state.selectedId)
  const selectComponent = useEditorStore((state) => state.selectComponent)
  const removeComponent = useEditorStore((state) => state.removeComponent)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: componentId,
    data: {
      type: component?.type,
      componentId,
    },
  })

  if (!component) return null

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...component.style, // Apply user defined styles
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectComponent(componentId)
  }

  const isSelected = selectedId === componentId
  const isContainer = ['Container', 'Form', 'Modal'].includes(component.type)

  // Helper to render children
  const renderChildren = () => {
    return component.children.map((childId) => (
      <ComponentRenderer key={childId} componentId={childId} />
    ))
  }

  // Content for container components
  const childrenContent = isContainer ? (
    <SortableContext items={component.children} strategy={verticalListSortingStrategy}>
      {component.children.length === 0 ? (
        <div className="flex min-h-[20px] items-center justify-center bg-gray-50/50 p-2 text-xs text-gray-300">
          Drop items here
        </div>
      ) : (
        renderChildren()
      )}
    </SortableContext>
  ) : null

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeComponent(componentId)
  }

  const selectionLabel = isSelected && (
    <div className="absolute -top-6 left-0 z-20 flex items-center gap-1 rounded-t-sm bg-[#16AA98] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
      <span>{component.type}</span>
      <span
        onClick={handleDelete}
        className="ml-1 flex cursor-pointer items-center justify-center rounded-full p-0.5 hover:bg-white/20"
        role="button"
        tabIndex={0}
        aria-label="Delete component"
      >
        <X className="h-3 w-3" />
      </span>
    </div>
  )

  const editorClassName = cn(
    'relative box-border transition-all',
    // Container specific styles for editor
    isContainer && 'min-h-[50px] min-w-[50px] p-2',
    isSelected && 'z-10 outline outline-2 outline-[#16AA98]',
    isDragging && 'opacity-50',
    // Visualization borders for layout components
    component.type === 'Container' && 'border border-dashed border-gray-300 bg-white'
  )

  const commonProps = {
    ref: setNodeRef,
    style: style as CSSProperties,
    onClick: handleClick,
    ...attributes,
    ...listeners,
    className: editorClassName,
  }

  // Props from component state
  const componentProps = component.props || {}

  switch (component.type) {
    case 'Container':
      return (
        <Container {...commonProps} {...componentProps}>
          {selectionLabel}
          {childrenContent}
        </Container>
      )
    case 'Modal':
      return (
        <Modal {...commonProps} {...componentProps}>
          {selectionLabel}
          {childrenContent}
        </Modal>
      )
    case 'Text':
      return (
        <Text {...commonProps} {...componentProps}>
          {selectionLabel}
        </Text>
      )
    case 'Button':
      return (
        <Button {...commonProps} {...componentProps}>
          {selectionLabel}
        </Button>
      )
    case 'Table':
      return (
        <Table {...commonProps} {...componentProps}>
          {selectionLabel}
        </Table>
      )
    case 'Form':
      return (
        <Form {...commonProps} {...componentProps}>
          {selectionLabel}
          {childrenContent}
        </Form>
      )
    default:
      return (
        <div {...commonProps}>
          {selectionLabel}
          <div className="p-2 text-red-500">Unknown Component: {component.type}</div>
        </div>
      )
  }
}
