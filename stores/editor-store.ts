import { create } from 'zustand'
import { ComponentNode, LayoutStyle } from '@/types/editor'

interface EditorState {
  components: Record<string, ComponentNode>
  rootId: string
  selectedId: string | null

  setComponents: (components: Record<string, ComponentNode>) => void
  addComponent: (parentId: string, component: ComponentNode, index?: number) => void
  removeComponent: (id: string) => void
  updateComponentProps: (id: string, props: Record<string, unknown>) => void
  updateComponentStyle: (id: string, style: LayoutStyle) => void
  selectComponent: (id: string | null) => void
  moveComponent: (id: string, newParentId: string, index: number) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  components: {},
  rootId: 'root',
  selectedId: null,

  setComponents: (components) => set({ components }),

  addComponent: (parentId, component, index) =>
    set((state) => {
      const parent = state.components[parentId]
      if (!parent) return state

      const newChildren = [...parent.children]
      if (typeof index === 'number' && index >= 0 && index <= newChildren.length) {
        newChildren.splice(index, 0, component.id)
      } else {
        newChildren.push(component.id)
      }

      return {
        components: {
          ...state.components,
          [parentId]: { ...parent, children: newChildren },
          [component.id]: component,
        },
      }
    }),

  removeComponent: (id) =>
    set((state) => {
      const component = state.components[id]
      if (!component || !component.parentId) return state

      const parent = state.components[component.parentId]
      if (!parent) return state

      const newChildren = parent.children.filter((childId) => childId !== id)

      // Note: This is a shallow removal. For a full implementation,
      // we should recursively remove all children of the component as well.
      const remainingComponents = { ...state.components }
      delete remainingComponents[id]

      return {
        components: {
          ...remainingComponents,
          [component.parentId]: { ...parent, children: newChildren },
        },
        selectedId: state.selectedId === id ? null : state.selectedId,
      }
    }),

  updateComponentProps: (id, props) =>
    set((state) => {
      const component = state.components[id]
      if (!component) return state
      return {
        components: {
          ...state.components,
          [id]: { ...component, props: { ...component.props, ...props } },
        },
      }
    }),

  updateComponentStyle: (id, style) =>
    set((state) => {
      const component = state.components[id]
      if (!component) return state
      return {
        components: {
          ...state.components,
          [id]: { ...component, style: { ...component.style, ...style } },
        },
      }
    }),

  selectComponent: (id) => set({ selectedId: id }),

  moveComponent: (id, newParentId, index) =>
    set((state) => {
      const component = state.components[id]
      if (!component || !component.parentId) return state

      const oldParent = state.components[component.parentId]
      const newParent = state.components[newParentId]

      if (!oldParent || !newParent) return state

      // If moving within the same parent
      if (component.parentId === newParentId) {
        const newChildren = [...oldParent.children]
        const oldIndex = newChildren.indexOf(id)
        if (oldIndex === -1) return state

        newChildren.splice(oldIndex, 1)
        // Adjust index if needed because of removal
        // If we are moving to a later position, the index might need adjustment if we just use the raw index
        // But usually dnd-kit gives the target index.
        // Let's assume index is the target index in the new list.
        newChildren.splice(index, 0, id)

        return {
          components: {
            ...state.components,
            [newParentId]: { ...newParent, children: newChildren },
          },
        }
      }

      // Moving to a different parent
      const oldChildren = oldParent.children.filter((childId) => childId !== id)
      const newChildren = [...newParent.children]
      newChildren.splice(index, 0, id)

      return {
        components: {
          ...state.components,
          [component.parentId]: { ...oldParent, children: oldChildren },
          [newParentId]: { ...newParent, children: newChildren },
          [id]: { ...component, parentId: newParentId },
        },
      }
    }),
}))
