'use client'

import { useEditorStore } from '@/stores/editor-store'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Container, Flex, Grid, Modal } from '@/components/renderer/layout-components'
import { Text, Button } from '@/components/renderer/basic-components'
import { Table, Form } from '@/components/renderer/data-components'
import { CSSProperties } from 'react'

interface ComponentRendererProps {
  componentId: string
}

export function ComponentRenderer({ componentId }: ComponentRendererProps) {
  const component = useEditorStore((state) => state.components[componentId])
  const selectedId = useEditorStore((state) => state.selectedId)
  const selectComponent = useEditorStore((state) => state.selectComponent)

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
  const isContainer = ['Container', 'Grid', 'Flex', 'Form', 'Modal'].includes(component.type)

  // Helper to render children
  const renderChildren = () => {
    return component.children.map((childId) => (
      <ComponentRenderer key={childId} componentId={childId} />
    ))
  }

  // Content for container components
  const childrenContent = isContainer ? (
    <SortableContext items={component.children} strategy={verticalListSortingStrategy}>
      <div
        className={cn(
          'h-full w-full',
          component.children.length === 0 &&
            'flex min-h-[20px] items-center justify-center bg-gray-50/50 p-2 text-xs text-gray-300'
        )}
      >
        {component.children.length === 0 ? 'Drop items here' : renderChildren()}
      </div>
    </SortableContext>
  ) : null

  const selectionLabel = isSelected && (
    <span className="pointer-events-none absolute -top-5 left-0 z-20 block whitespace-nowrap rounded-t-sm bg-[#16AA98] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
      {component.type}
    </span>
  )

  const editorClassName = cn(
    'relative box-border transition-all',
    // Container specific styles for editor
    isContainer && 'min-h-[50px] min-w-[50px] p-2',
    isSelected && 'z-10 outline outline-2 outline-[#16AA98]',
    isDragging && 'opacity-50',
    // Visualization borders for layout components
    (component.type === 'Container' || component.type === 'Grid' || component.type === 'Flex') &&
      'border border-dashed border-gray-300 bg-white'
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
    case 'Flex':
      return (
        <Flex {...commonProps} {...componentProps}>
          {selectionLabel}
          {childrenContent}
        </Flex>
      )
    case 'Grid':
      return (
        <Grid {...commonProps} {...componentProps}>
          {selectionLabel}
          {childrenContent}
        </Grid>
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
