'use client'

import { useDroppable } from '@dnd-kit/core'
import { useEditorStore } from '@/stores/editor-store'
import { ComponentRenderer } from './component-renderer'
import { cn } from '@/lib/utils'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export function Canvas() {
  const { rootId, components, selectComponent } = useEditorStore()
  const rootComponent = components[rootId]

  const { setNodeRef, isOver } = useDroppable({
    id: rootId,
    data: {
      type: 'Container', // Treat canvas root as container
      accepts: ['Container', 'Grid', 'Flex', 'Form', 'Table', 'Button', 'Text'],
    },
  })

  // Handle click on canvas to deselect
  const handleCanvasClick = () => {
    selectComponent(null)
  }

  return (
    <main
      className="relative flex flex-1 flex-col items-center overflow-auto bg-[#e5e5e5] py-10"
      onClick={handleCanvasClick}
      style={{
        backgroundImage: `
              linear-gradient(rgba(56, 56, 56, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56, 56, 56, 0.1) 1px, transparent 1px)
            `,
        backgroundSize: '20px 20px',
      }}
    >
      <div
        ref={setNodeRef}
        className={cn(
          'w-full max-w-[800px] bg-white shadow-sm transition-colors',
          isOver && 'ring-2 ring-[#16AA98] ring-opacity-50'
        )}
      >
        {rootComponent && (
          <SortableContext items={rootComponent.children} strategy={verticalListSortingStrategy}>
            <div className="flex min-h-[800px] w-full flex-col gap-2 p-8">
              {rootComponent.children.map((childId) => (
                <ComponentRenderer key={childId} componentId={childId} />
              ))}
              {rootComponent.children.length === 0 && (
                <div className="m-4 flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-300">
                  Drag components here
                </div>
              )}
            </div>
          </SortableContext>
        )}
      </div>
    </main>
  )
}
