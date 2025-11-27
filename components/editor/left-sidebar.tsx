'use client'

import { Database, Type, Square, Table, MousePointerClick, AppWindow } from 'lucide-react'
import { SidebarItem } from './sidebar-item'
import { useState } from 'react'
import { ComponentTree } from './component-tree'

export function LeftSidebar() {
  const [activeTab, setActiveTab] = useState<'components' | 'tree'>('components')

  return (
    <aside className="flex h-full w-[280px] flex-col border-r border-[#383838] bg-white">
      <div className="flex h-12 shrink-0 items-stretch border-b border-[#383838]">
        <button
          onClick={() => setActiveTab('components')}
          className={`flex flex-1 items-center justify-center text-xs font-bold ${
            activeTab === 'components'
              ? 'border-b-2 border-[#16AA98] bg-white text-[#383838]'
              : 'bg-[#F4EFEA] text-[#888] hover:bg-[#e0dbd6]'
          }`}
        >
          COMPONENTS
        </button>
        <button
          onClick={() => setActiveTab('tree')}
          className={`flex flex-1 items-center justify-center text-xs font-bold ${
            activeTab === 'tree'
              ? 'border-b-2 border-[#16AA98] bg-white text-[#383838]'
              : 'bg-[#F4EFEA] text-[#888] hover:bg-[#e0dbd6]'
          }`}
        >
          TREE
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'components' ? (
          <div className="space-y-6 p-4">
            {/* Layout */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#888]">
                Layout
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <SidebarItem type="Container" icon={Square} label="Container" />
                <SidebarItem type="Modal" icon={AppWindow} label="Modal" />
              </div>
            </div>

            {/* Data Display */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#888]">
                Data Display
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <SidebarItem type="Table" icon={Table} label="Table" />
              </div>
            </div>

            {/* Form */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#888]">
                Form
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <SidebarItem type="Form" icon={Database} label="Form" />
                <SidebarItem type="Button" icon={MousePointerClick} label="Button" />
              </div>
            </div>

            {/* Basic */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#888]">
                Basic
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <SidebarItem type="Text" icon={Type} label="Text" />
              </div>
            </div>
          </div>
        ) : (
          <ComponentTree />
        )}
      </div>
    </aside>
  )
}
