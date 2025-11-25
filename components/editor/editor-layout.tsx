'use client'

import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
  closestCenter,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useState, useEffect } from 'react'
import { LeftSidebar } from './left-sidebar'
import { RightPanel } from './right-panel'
import { EditorHeader } from './header'
import { Canvas } from './canvas'
import { SidebarItem } from './sidebar-item'
import { useEditorStore } from '@/stores/editor-store'
import { ComponentNode, ComponentType } from '@/types/editor'
import { createPortal } from 'react-dom'
import {
  LucideIcon,
  Square,
  Layout,
  Table,
  Database,
  Type,
  MousePointerClick,
  AppWindow,
} from 'lucide-react'

// Map types to icons for DragOverlay
const iconMap: Record<string, LucideIcon> = {
  Container: Square,
  Grid: Layout,
  Flex: Layout,
  Table: Table,
  Form: Database,
  Button: MousePointerClick,
  Text: Type,
  Modal: AppWindow,
}

interface EditorLayoutProps {
  pageId: string
  pageName: string
  children?: React.ReactNode
}

interface DragItemData {
  type: string
  isSidebarItem?: boolean
}

export function EditorLayout({ pageId, pageName }: EditorLayoutProps) {
  const [activeDragItem, setActiveDragItem] = useState<DragItemData | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { addComponent, reorderChildren, components, rootId } = useEditorStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveDragItem(active.data.current as DragItemData)
  }

  const handleDragOver = () => {
    // Logic for drag over - mainly for visual feedback if needed
    // Dnd-kit handles sortable visual feedback automatically via SortableContext
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragItem(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeData = active.data.current as DragItemData

    // Case 1: Dragging from Sidebar to Canvas
    if (activeData?.isSidebarItem) {
      const type = activeData.type
      const newId = crypto.randomUUID()

      // Define default props based on type
      const defaultProps: Record<string, unknown> = {}
      if (type === 'Text') defaultProps.content = 'New Text'
      if (type === 'Button') defaultProps.label = 'New Button'

      const newComponent: ComponentNode = {
        id: newId,
        type: type as ComponentType,
        props: defaultProps,
        children: [],
        parentId: null, // will be set by addComponent
        style: {},
      }

      // Determine drop target
      // If dropped over a component, add as child (if container) or sibling?

      const overComponent = components[overId]
      let parentId = overId

      if (!overComponent) {
        // Dropped on root/canvas
        if (overId === rootId) {
          parentId = rootId
        } else {
          return // Unknown drop target
        }
      } else {
        const isContainer =
          ['Container', 'Grid', 'Flex', 'Form', 'Modal'].includes(overComponent.type) ||
          overId === rootId
        if (!isContainer && overComponent.parentId) {
          parentId = overComponent.parentId
        } else if (!isContainer) {
          return
        }
      }

      addComponent(parentId, newComponent)
      return
    }

    // Case 2: Reordering existing components (sortable)
    if (activeId !== overId) {
      const activeComponent = components[activeId]
      const overComponent = components[overId]

      if (!activeComponent || !overComponent) return

      // Only allow reordering if they have the same parent
      if (activeComponent.parentId === overComponent.parentId) {
        const parent = components[activeComponent.parentId!]
        if (!parent) return

        const oldIndex = parent.children.indexOf(activeId)
        const newIndex = parent.children.indexOf(overId)

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          // Use arrayMove to get the correct new order
          const newChildren = arrayMove(parent.children, oldIndex, newIndex)
          // Update the store with the new children order
          reorderChildren(activeComponent.parentId!, newChildren)
        }
      }
    }
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  }

  return (
    <DndContext
      id="editor-dnd-context"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen flex-col overflow-hidden bg-[#F4EFEA]">
        <EditorHeader pageId={pageId} pageName={pageName} />
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />
          <Canvas />
          <RightPanel />
        </div>
      </div>

      {mounted &&
        createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeDragItem ? (
              activeDragItem.isSidebarItem ? (
                <SidebarItem
                  type={activeDragItem.type}
                  icon={iconMap[activeDragItem.type] || Square}
                  label={activeDragItem.type}
                />
              ) : (
                <div className="border border-[#16AA98] bg-white p-2 opacity-80">
                  {activeDragItem.type}
                </div>
              )
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  )
}
