'use client'

import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface SidebarItemProps {
  type: string
  icon: LucideIcon
  label: string
}

export function SidebarItem({ type, icon: Icon, label }: SidebarItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: {
      type,
      isSidebarItem: true,
    },
  })

  // 不应用 transform 到原始元素，让它保持不动
  // 拖拽预览通过 DragOverlay 在 editor-layout.tsx 中显示

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex cursor-grab select-none flex-col items-center gap-2 border border-[#383838] bg-white p-3 transition-all hover:bg-gray-50',
        isDragging && 'opacity-50'
      )}
    >
      <Icon className="h-6 w-6 text-[#383838]" />
      <span className="text-xs font-medium text-[#383838]">{label}</span>
    </div>
  )
}
