'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { ComponentNode } from '@/types/editor'

export function EditorInitializer({
  initialComponents,
}: {
  initialComponents: Record<string, ComponentNode>
}) {
  const { setComponents } = useEditorStore()

  useEffect(() => {
    if (initialComponents && Object.keys(initialComponents).length > 0) {
      setComponents(initialComponents)
    } else {
      // Initialize with default root if empty
      setComponents({
        root: {
          id: 'root',
          type: 'Container',
          parentId: null,
          children: [],
          props: {},
          style: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        },
      })
    }
  }, [initialComponents, setComponents])

  return null
}
