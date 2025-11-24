'use client'

import { useEditorStore } from '@/stores/editor-store'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

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

  // Helper to render children
  const renderChildren = () => {
    return component.children.map((childId) => (
      <ComponentRenderer key={childId} componentId={childId} />
    ))
  }

  const isContainer = ['Container', 'Grid', 'Flex', 'Form'].includes(component.type)

  return (
    <div
      ref={setNodeRef}
      style={style as React.CSSProperties}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(
        'relative box-border min-h-[50px] min-w-[50px] p-2',
        isSelected && 'z-10 outline outline-2 outline-[#16AA98]',
        isDragging && 'opacity-50',
        // Basic styling for visualization
        component.type === 'Container' && 'border border-dashed border-gray-300 bg-white',
        component.type === 'Button' &&
          'inline-flex cursor-pointer items-center justify-center bg-[#16AA98] px-4 py-2 text-white hover:opacity-90',
        component.type === 'Text' && 'text-[#383838]',
        component.type === 'Grid' && 'grid grid-cols-2 gap-4 border border-dashed border-gray-300',
        component.type === 'Flex' && 'flex gap-4 border border-dashed border-gray-300'
      )}
    >
      {isSelected && (
        <div className="pointer-events-none absolute -top-5 left-0 z-20 whitespace-nowrap rounded-t-sm bg-[#16AA98] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          {component.type}
        </div>
      )}

      {component.type === 'Text' && ((component.props.content as string) || 'Text Component')}
      {component.type === 'Button' && ((component.props.label as string) || 'Button')}

      {/* Container-like components render children */}
      {isContainer && (
        <SortableContext items={component.children} strategy={verticalListSortingStrategy}>
          <div
            className={cn(
              'h-full min-h-[20px] w-full',
              component.children.length === 0 &&
                'flex items-center justify-center bg-gray-50/50 text-xs text-gray-300'
            )}
          >
            {component.children.length === 0 ? 'Drop items here' : renderChildren()}
          </div>
        </SortableContext>
      )}

      {component.type === 'Table' && (
        <div className="flex h-32 w-full items-center justify-center border bg-gray-50 text-sm text-gray-400">
          Table Placeholder
        </div>
      )}
    </div>
  )
}
