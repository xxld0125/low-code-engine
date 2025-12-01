'use client'

import { useDragDropContext } from './drag-drop-context'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

const INDICATOR_COLOR = '#16AA98'

export function DropIndicator() {
  const { dropTarget, isDragging } = useDragDropContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 不在拖拽中或没有放置目标时不渲染
  if (!mounted || !isDragging || !dropTarget) {
    return null
  }

  const { type, indicatorRect } = dropTarget

  // 容器类型：渲染蓝色边框
  if (type === 'container') {
    return createPortal(
      <div
        className="pointer-events-none fixed z-[9999] border-2 transition-all duration-75"
        style={{
          top: indicatorRect.top,
          left: indicatorRect.left,
          width: indicatorRect.width,
          height: indicatorRect.height,
          borderColor: INDICATOR_COLOR,
          backgroundColor: `${INDICATOR_COLOR}10`, // 10% 透明度
        }}
      />,
      document.body
    )
  }

  // 插入点类型：渲染蓝色线条
  if (type === 'insertion-point') {
    return createPortal(
      <div
        className="pointer-events-none fixed z-[9999] transition-all duration-75"
        style={{
          top: indicatorRect.top,
          left: indicatorRect.left,
          width: indicatorRect.width,
          height: 4,
          backgroundColor: INDICATOR_COLOR,
          borderRadius: 2,
          boxShadow: `0 0 8px ${INDICATOR_COLOR}80`,
        }}
      />,
      document.body
    )
  }

  return null
}
