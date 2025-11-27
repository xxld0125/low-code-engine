'use client'

import { useEditorStore } from '@/stores/editor-store'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ChevronRight,
  ChevronDown,
  Square,
  Layout,
  Table,
  Database,
  Type,
  MousePointerClick,
  AppWindow,
  LucideIcon,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
// import { createPortal } from 'react-dom'

// Map types to icons
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

interface TreeNodeProps {
  nodeId: string
  level?: number
  isRoot?: boolean
}

function SortableTreeNode({ nodeId, level = 0, isRoot = false }: TreeNodeProps) {
  const { components, selectedId, selectComponent, removeComponent } = useEditorStore()
  const [expanded, setExpanded] = useState(true)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: nodeId,
    disabled: isRoot,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const component = components[nodeId]
  if (!component) return null

  const hasChildren = component.children && component.children.length > 0
  const isSelected = selectedId === nodeId
  const Icon = iconMap[component.type] || Square

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectComponent(nodeId)
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeComponent(nodeId)
  }

  return (
    <div ref={setNodeRef} style={style} className="select-none">
      <div
        className={`group flex cursor-pointer items-center py-1 pr-2 text-xs transition-colors hover:bg-gray-100 ${
          isSelected ? 'bg-accent/10 text-accent' : 'text-gray-700'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleSelect}
        {...attributes}
        {...listeners}
      >
        <div
          className={`mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-gray-200 ${
            hasChildren ? 'visible' : 'invisible'
          }`}
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on expand button
          onClick={toggleExpand}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </div>

        <Icon size={14} className="mr-2 shrink-0" />
        <span className="flex-1 truncate font-medium">{component.id}</span>

        {!isRoot && (
          <button
            className="invisible ml-2 text-gray-400 hover:text-red-500 group-hover:visible"
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag
            onClick={handleDelete}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {hasChildren && expanded && (
        <SortableContext items={component.children} strategy={verticalListSortingStrategy}>
          <div>
            {component.children.map((childId) => (
              <SortableTreeNode key={childId} nodeId={childId} level={level + 1} />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  )
}

export function ComponentTree() {
  const { rootId, components, reorderChildren } = useEditorStore()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    if (active.id !== over.id) {
      const activeComponent = components[active.id]
      const overComponent = components[over.id]

      if (activeComponent && overComponent && activeComponent.parentId === overComponent.parentId) {
        const parentId = activeComponent.parentId
        if (!parentId) return

        const parent = components[parentId]
        const oldIndex = parent.children.indexOf(active.id as string)
        const newIndex = parent.children.indexOf(over.id as string)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newChildren = arrayMove(parent.children, oldIndex, newIndex)
          reorderChildren(parentId, newChildren)
        }
      }
    }
  }

  if (!components[rootId]) return <div className="p-4 text-xs text-gray-500">Loading...</div>

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full overflow-y-auto py-2">
        <SortableTreeNode nodeId={rootId} isRoot />
      </div>
    </DndContext>
  )
}
