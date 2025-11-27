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
  pointerWithin,
} from '@dnd-kit/core'
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

  const { addComponent, moveComponent, components, rootId } = useEditorStore()

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

    // If no drop target, do nothing
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeData = active.data.current as DragItemData

    // Case 1: Dragging from Sidebar to Canvas
    if (activeData?.isSidebarItem) {
      // CRITICAL: Only allow drops on canvas (rootId) or existing components
      // Reject drops on sidebar items (which have IDs like "sidebar-Button")
      const isDropOnCanvas = overId === rootId
      const isDropOnComponent = components[overId] !== undefined

      if (!isDropOnCanvas && !isDropOnComponent) {
        // Dropped on an invalid area (e.g., sidebar, header, etc.)
        return
      }

      const type = activeData.type

      // Generate ID: Type_Index
      const existingComponents = Object.values(components).filter((c) => c.type === type)
      let maxIndex = 0
      existingComponents.forEach((c) => {
        const parts = c.id.split('_')
        if (parts.length === 2 && parts[0] === type) {
          const index = parseInt(parts[1], 10)
          if (!isNaN(index) && index > maxIndex) {
            maxIndex = index
          }
        }
      })
      const newId = `${type}_${maxIndex + 1}`

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
      const overComponent = components[overId]
      let parentId = overId

      if (!overComponent) {
        // Dropped on root/canvas
        if (overId === rootId) {
          parentId = rootId
        } else {
          // Should not reach here due to the check above, but safety return
          return
        }
      } else {
        // Check if dropped on a container
        const isContainer =
          ['Container', 'Grid', 'Flex', 'Form', 'Modal'].includes(overComponent.type) ||
          overId === rootId

        if (isContainer) {
          parentId = overId
        } else if (overComponent.parentId) {
          // If dropped on a non-container, add as sibling
          parentId = overComponent.parentId
        } else {
          // Should not happen if root is handled, but safety check
          return
        }
      }

      addComponent(parentId, newComponent)
      return
    }

    // Case 2: Reordering or Moving existing components
    if (activeId !== overId) {
      const activeComponent = components[activeId]
      const overComponent = components[overId]

      if (!activeComponent || !overComponent) return

      // Check for circular reference (trying to drop parent into child)
      let currentId: string | null = overId
      while (currentId) {
        if (currentId === activeId) return // Cannot drop into itself or its children
        currentId = components[currentId]?.parentId || null
      }

      const isOverContainer =
        ['Container', 'Grid', 'Flex', 'Form', 'Modal'].includes(overComponent.type) ||
        overId === rootId

      // Scenario 1: Dropping onto a container (Reparenting to end of container)
      // But only if it's NOT the current parent (unless we want to move to end?)
      // And not if we are reordering siblings where overComponent IS a container
      // Sidebar logic prioritizes container drop. We will do the same.
      if (isOverContainer) {
        moveComponent(activeId, overId, overComponent.children.length)
        return
      }

      // Scenario 2: Dropping onto a component (sibling reference)
      if (overComponent.parentId) {
        const parent = components[overComponent.parentId]
        const newIndex = parent.children.indexOf(overId)
        moveComponent(activeId, overComponent.parentId, newIndex)
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
      collisionDetection={pointerWithin}
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
