'use client'

import { useEditorStore } from '@/stores/editor-store'
import { useState, useEffect } from 'react'
import { PropsTab } from './props-tab'
import { StyleTab } from './style-tab'
import { EventsTab } from './events-tab'

type TabType = 'props' | 'style' | 'events'

export function PropertyPanel() {
  const { selectedId, components } = useEditorStore()
  const [activeTab, setActiveTab] = useState<TabType>('props')

  // Reset to props tab when selection changes
  useEffect(() => {
    if (selectedId) {
      setActiveTab('props')
    }
  }, [selectedId])

  const selectedComponent = selectedId ? components[selectedId] : null
  const hasEvents = selectedComponent && ['Button', 'Form'].includes(selectedComponent.type)

  return (
    <aside className="flex h-full w-[300px] flex-col border-l border-primary bg-white">
      {/* Tab Headers */}
      <div className="flex h-12 shrink-0 items-stretch border-b border-primary">
        <button
          onClick={() => setActiveTab('props')}
          aria-label="Component Properties"
          className={`flex flex-1 items-center justify-center text-xs font-bold ${
            activeTab === 'props'
              ? 'border-b-2 border-accent bg-white text-primary'
              : 'bg-background text-[#888] hover:bg-[#e0dbd6]'
          }`}
        >
          PROPS
        </button>
        <button
          onClick={() => setActiveTab('style')}
          aria-label="Component Styles"
          className={`flex flex-1 items-center justify-center text-xs font-bold ${
            activeTab === 'style'
              ? 'border-b-2 border-accent bg-white text-primary'
              : 'bg-background text-[#888] hover:bg-[#e0dbd6]'
          }`}
        >
          STYLE
        </button>
        {hasEvents && (
          <button
            onClick={() => setActiveTab('events')}
            aria-label="Component Events"
            className={`flex flex-1 items-center justify-center text-xs font-bold ${
              activeTab === 'events'
                ? 'border-b-2 border-accent bg-white text-primary'
                : 'bg-background text-[#888] hover:bg-[#e0dbd6]'
            }`}
          >
            EVENTS
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedComponent ? (
          <>
            {activeTab === 'props' && <PropsTab component={selectedComponent} />}
            {activeTab === 'style' && <StyleTab component={selectedComponent} />}
            {activeTab === 'events' && <EventsTab component={selectedComponent} />}
          </>
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center text-sm text-gray-400">
            Select a component to edit properties
          </div>
        )}
      </div>
    </aside>
  )
}
