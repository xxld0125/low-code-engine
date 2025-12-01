'use client'

import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
  pointerWithin,
  Modifier,
} from '@dnd-kit/core'
import { useState, useEffect, useRef, useCallback } from 'react'
import { LeftSidebar } from './left-sidebar'
import { RightPanel } from './right-panel'
import { EditorHeader } from './header'
import { Canvas } from './canvas'
import { useEditorStore } from '@/stores/editor-store'
import { ComponentNode, ComponentType } from '@/types/editor'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { DragDropProvider, useDragDropContext, DropTargetState } from './drag-drop-context'
import { DropIndicator } from './drop-indicator'
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning'

// 容器类型列表
const CONTAINER_TYPES = ['Container', 'Grid', 'Flex', 'Form', 'Modal']

// 边缘检测阈值（像素）
const EDGE_THRESHOLD = 12

// 自定义 modifier: 仅对侧边栏拖拽项应用居中到鼠标
const snapSidebarItemToCursor: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  transform,
  active,
}) => {
  // 只对侧边栏项目应用
  if (!active?.data.current?.isSidebarItem) {
    return transform
  }

  if (draggingNodeRect && activatorEvent) {
    const activatorCoordinates = {
      x: (activatorEvent as MouseEvent).clientX,
      y: (activatorEvent as MouseEvent).clientY,
    }

    // 计算鼠标点击位置相对于元素左上角的偏移
    const offsetX = activatorCoordinates.x - draggingNodeRect.left
    const offsetY = activatorCoordinates.y - draggingNodeRect.top

    return {
      ...transform,
      // 调整 transform 使元素中心对齐到鼠标位置
      x: transform.x + offsetX - draggingNodeRect.width / 2,
      y: transform.y + offsetY - draggingNodeRect.height / 2,
    }
  }

  return transform
}

interface EditorLayoutProps {
  pageId: string
  pageName: string
  children?: React.ReactNode
}

interface DragItemData {
  type: string
  isSidebarItem?: boolean
  componentId?: string
}

function EditorLayoutContent({ pageId, pageName }: EditorLayoutProps) {
  const [activeDragItem, setActiveDragItem] = useState<DragItemData | null>(null)
  const [mounted, setMounted] = useState(false)
  const mousePositionRef = useRef({ x: 0, y: 0 })

  const { setDropTarget, setIsDragging } = useDragDropContext()
  const isDirty = useEditorStore((state) => state.isDirty)

  // 监听未保存更改，在用户尝试刷新/关闭页面时提醒
  useUnsavedChangesWarning(isDirty)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 全局监听鼠标位置
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const { addComponent, moveComponent, components, rootId } = useEditorStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  // 判断是否为容器类型
  const isContainerType = useCallback((type: string) => {
    return CONTAINER_TYPES.includes(type)
  }, [])

  // 核心算法：找到最近的插入点
  const findClosestInsertionPoint = useCallback(
    (event: DragOverEvent): DropTargetState | null => {
      const { over } = event
      if (!over) return null

      const overId = over.id as string
      const pointerX = mousePositionRef.current.x
      const pointerY = mousePositionRef.current.y

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Case 1: 直接拖到 root (画布)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      if (overId === rootId) {
        const rootElement = document.querySelector(`[data-component-id="${rootId}"]`)
        if (rootElement) {
          const rect = rootElement.getBoundingClientRect()
          return {
            type: 'container',
            targetId: rootId,
            indicatorRect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            },
          }
        }
        return null
      }

      const overComponent = components[overId]
      if (!overComponent) return null

      // 获取元素矩形
      const overElement = document.querySelector(`[data-component-id="${overId}"]`)
      if (!overElement) return null

      const overRect = overElement.getBoundingClientRect()
      const relativeY = pointerY - overRect.top
      const isOverContainer = isContainerType(overComponent.type)

      // 边缘检测
      const nearTop = relativeY < EDGE_THRESHOLD
      const nearBottom = relativeY > overRect.height - EDGE_THRESHOLD

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Case 2: 悬停在 Container 类组件上
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      if (isOverContainer) {
        // 鼠标在容器边缘 → 插入到容器前/后（作为兄弟）
        if (nearTop && overComponent.parentId) {
          return {
            type: 'insertion-point',
            targetId: overId,
            position: 'before',
            indicatorRect: {
              top: overRect.top - 2,
              left: overRect.left,
              width: overRect.width,
              height: 4,
            },
          }
        }
        if (nearBottom && overComponent.parentId) {
          return {
            type: 'insertion-point',
            targetId: overId,
            position: 'after',
            indicatorRect: {
              top: overRect.bottom - 2,
              left: overRect.left,
              width: overRect.width,
              height: 4,
            },
          }
        }

        // 鼠标在容器中心 → 放入容器内部
        return {
          type: 'container',
          targetId: overId,
          indicatorRect: {
            top: overRect.top,
            left: overRect.left,
            width: overRect.width,
            height: overRect.height,
          },
        }
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Case 3: 悬停在非容器组件上（如 Text, Button）
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      // 鼠标在子元素边缘 → 插入到该子元素前/后
      if (nearTop) {
        return {
          type: 'insertion-point',
          targetId: overId,
          position: 'before',
          indicatorRect: {
            top: overRect.top - 2,
            left: overRect.left,
            width: overRect.width,
            height: 4,
          },
        }
      }
      if (nearBottom) {
        return {
          type: 'insertion-point',
          targetId: overId,
          position: 'after',
          indicatorRect: {
            top: overRect.bottom - 2,
            left: overRect.left,
            width: overRect.width,
            height: 4,
          },
        }
      }

      // 鼠标在子元素中心 → 使用 elementsFromPoint 查找父容器
      const elementsAtPoint = document.elementsFromPoint(pointerX, pointerY)

      // 遍历找到最近的容器祖先
      for (const el of elementsAtPoint) {
        const componentId = el.getAttribute('data-component-id')
        if (componentId && componentId !== overId) {
          const comp = components[componentId]
          if (comp && (isContainerType(comp.type) || componentId === rootId)) {
            const containerRect = el.getBoundingClientRect()
            return {
              type: 'container',
              targetId: componentId,
              indicatorRect: {
                top: containerRect.top,
                left: containerRect.left,
                width: containerRect.width,
                height: containerRect.height,
              },
            }
          }
        }
      }

      // 回退：如果有父容器，放入父容器
      if (overComponent.parentId) {
        const parentElement = document.querySelector(
          `[data-component-id="${overComponent.parentId}"]`
        )
        if (parentElement) {
          const parentRect = parentElement.getBoundingClientRect()
          return {
            type: 'container',
            targetId: overComponent.parentId,
            indicatorRect: {
              top: parentRect.top,
              left: parentRect.left,
              width: parentRect.width,
              height: parentRect.height,
            },
          }
        }
      }

      return null
    },
    [components, rootId, isContainerType]
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveDragItem(active.data.current as DragItemData)
    setIsDragging(true)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const dropTarget = findClosestInsertionPoint(event)
    setDropTarget(dropTarget)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event
    setActiveDragItem(null)
    setIsDragging(false)

    // 获取当前的 dropTarget 状态
    const dropTarget = findClosestInsertionPoint(event as DragOverEvent)

    if (!dropTarget) {
      setDropTarget(null)
      return
    }

    const activeId = active.id as string
    const activeData = active.data.current as DragItemData

    // Case 1: 从侧边栏拖入画布
    if (activeData?.isSidebarItem) {
      const type = activeData.type

      // 生成唯一 ID
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

      // 默认属性
      const defaultProps: Record<string, unknown> = {}
      if (type === 'Text') defaultProps.content = 'New Text'
      if (type === 'Button') defaultProps.label = 'New Button'

      const newComponent: ComponentNode = {
        id: newId,
        type: type as ComponentType,
        props: defaultProps,
        children: [],
        parentId: null,
        style: {},
      }

      if (dropTarget.type === 'container') {
        // 放入容器内部
        addComponent(dropTarget.targetId, newComponent)
      } else if (dropTarget.type === 'insertion-point') {
        // 插入到指定位置
        const targetComponent = components[dropTarget.targetId]
        if (targetComponent?.parentId) {
          const parent = components[targetComponent.parentId]
          const targetIndex = parent.children.indexOf(dropTarget.targetId)
          const insertIndex = dropTarget.position === 'before' ? targetIndex : targetIndex + 1
          addComponent(targetComponent.parentId, newComponent, insertIndex)
        }
      }

      setDropTarget(null)
      return
    }

    // Case 2: 移动已有组件
    if (activeId !== dropTarget.targetId) {
      const activeComponent = components[activeId]
      if (!activeComponent) {
        setDropTarget(null)
        return
      }

      // 循环引用检测
      let currentId: string | null = dropTarget.targetId
      while (currentId) {
        if (currentId === activeId) {
          setDropTarget(null)
          return
        }
        currentId = components[currentId]?.parentId || null
      }

      if (dropTarget.type === 'container') {
        // 放入容器内部（末尾）
        const targetContainer = components[dropTarget.targetId]
        if (targetContainer || dropTarget.targetId === rootId) {
          const containerChildren =
            dropTarget.targetId === rootId
              ? components[rootId]?.children || []
              : targetContainer?.children || []
          moveComponent(activeId, dropTarget.targetId, containerChildren.length)
        }
      } else if (dropTarget.type === 'insertion-point') {
        // 插入到指定位置
        const targetComponent = components[dropTarget.targetId]
        if (targetComponent?.parentId) {
          const parent = components[targetComponent.parentId]
          const targetIndex = parent.children.indexOf(dropTarget.targetId)

          // 计算正确的插入索引
          let insertIndex = dropTarget.position === 'before' ? targetIndex : targetIndex + 1

          // 如果在同一父级内移动，需要调整索引
          if (activeComponent.parentId === targetComponent.parentId) {
            const currentIndex = parent.children.indexOf(activeId)
            if (currentIndex < targetIndex) {
              insertIndex -= 1
            }
          }

          moveComponent(activeId, targetComponent.parentId, insertIndex)
        }
      }
    }

    setDropTarget(null)
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
      modifiers={[snapSidebarItemToCursor]}
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

      {/* 放置指示器 */}
      <DropIndicator />

      {mounted &&
        createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeDragItem ? (
              <div className="flex w-max cursor-grabbing items-center gap-1 rounded-sm bg-[#16AA98] px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                <span>{activeDragItem.componentId || activeDragItem.type}</span>
                <span className="ml-1 flex items-center justify-center">
                  <X className="h-3 w-3" />
                </span>
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  )
}

export function EditorLayout({ pageId, pageName }: EditorLayoutProps) {
  return (
    <DragDropProvider>
      <EditorLayoutContent pageId={pageId} pageName={pageName} />
    </DragDropProvider>
  )
}
