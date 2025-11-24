'use client'

import { useEditorStore } from '@/stores/editor-store'

export function RightPanel() {
  const { selectedId } = useEditorStore()

  return (
    <aside className="flex h-full w-[300px] flex-col border-l border-[#383838] bg-white">
      <div className="flex h-12 shrink-0 items-stretch border-b border-[#383838]">
        <button className="flex flex-1 items-center justify-center border-b-2 border-[#16AA98] bg-white text-xs font-bold text-[#383838]">
          PROPS
        </button>
        <button className="flex flex-1 items-center justify-center bg-[#F4EFEA] text-xs font-semibold text-[#888] hover:bg-[#e0dbd6]">
          STYLE
        </button>
        <button className="flex flex-1 items-center justify-center bg-[#F4EFEA] text-xs font-semibold text-[#888] hover:bg-[#e0dbd6]">
          EVENTS
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedId ? (
          <div>
            <div className="mb-4 text-[11px] font-bold uppercase tracking-wide text-[#16AA98]">
              Component Settings
            </div>
            <div className="mb-4 text-sm text-[#383838]">
              Selected Component ID:{' '}
              <span className="bg-gray-100 p-1 font-mono text-xs">{selectedId}</span>
            </div>
            {/* TODO: Render dynamic form based on component type */}
            <div className="text-xs italic text-gray-400">
              Properties panel will be implemented in Phase 5.
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center text-sm text-gray-400">
            Select a component to edit properties
          </div>
        )}
      </div>
    </aside>
  )
}
