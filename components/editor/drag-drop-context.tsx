'use client'

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
} from 'react'

// 放置指示器的位置信息
export interface IndicatorRect {
  top: number
  left: number
  width: number
  height: number
}

// 放置目标状态
export interface DropTargetState {
  type: 'container' | 'insertion-point' // 放入容器内部 or 插入两个组件之间
  targetId: string // 目标组件 ID
  position?: 'before' | 'after' // 仅 insertion-point 需要
  indicatorRect: IndicatorRect // 用于绘制高亮的坐标
}

interface DragDropContextValue {
  dropTarget: DropTargetState | null
  setDropTarget: (target: DropTargetState | null) => void
  isDragging: boolean
  setIsDragging: (dragging: boolean) => void
  mousePosition: { x: number; y: number }
}

const DragDropContext = createContext<DragDropContextValue | null>(null)

interface DragDropProviderProps {
  children: ReactNode
}

export function DragDropProvider({ children }: DragDropProviderProps) {
  const [dropTarget, setDropTarget] = useState<DropTargetState | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // 全局监听鼠标位置
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY }
      // 仅在拖拽时更新状态，避免不必要的渲染
      if (isDragging) {
        setMousePosition({ x: e.clientX, y: e.clientY })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isDragging])

  const handleSetDropTarget = useCallback((target: DropTargetState | null) => {
    setDropTarget(target)
  }, [])

  const handleSetIsDragging = useCallback((dragging: boolean) => {
    setIsDragging(dragging)
    if (!dragging) {
      setDropTarget(null)
    }
  }, [])

  return (
    <DragDropContext.Provider
      value={{
        dropTarget,
        setDropTarget: handleSetDropTarget,
        isDragging,
        setIsDragging: handleSetIsDragging,
        mousePosition,
      }}
    >
      {children}
    </DragDropContext.Provider>
  )
}

export function useDragDropContext() {
  const context = useContext(DragDropContext)
  if (!context) {
    throw new Error('useDragDropContext must be used within DragDropProvider')
  }
  return context
}

// 提供 ref 访问最新鼠标位置（避免闭包问题）
export function useMousePositionRef() {
  const mousePositionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return mousePositionRef
}
