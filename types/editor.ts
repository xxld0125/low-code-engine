export type ComponentType = 'Container' | 'Button' | 'Text' | 'Table' | 'Form' | 'Modal'

export interface LayoutStyle {
  padding?: string
  margin?: string
  width?: string
  height?: string
  display?: 'block' | 'flex' | 'grid'
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between'
  alignItems?: 'flex-start' | 'center' | 'flex-end'
  gap?: string
  [key: string]: string | number | undefined
}

export enum ActionType {
  OPEN_MODAL = 'OPEN_MODAL',
  CLOSE_MODAL = 'CLOSE_MODAL',
  SUBMIT_FORM = 'SUBMIT_FORM',
  REFRESH_TABLE = 'REFRESH_TABLE',
  NAVIGATE = 'NAVIGATE',
  SHOW_TOAST = 'SHOW_TOAST',
}

export interface ActionConfig {
  trigger: 'onClick' | 'onSubmit'
  type: ActionType
  payload: ActionPayload
}

export type ActionPayload =
  | { modalId: string } // OPEN_MODAL, CLOSE_MODAL
  | { url: string } // NAVIGATE
  | { type: 'success' | 'error' | 'info'; message: string } // SHOW_TOAST
  | { tableId?: string } // REFRESH_TABLE
  | { formId?: string } // SUBMIT_FORM
  | Record<string, unknown> // Fallback

export interface ComponentNode {
  id: string
  type: ComponentType
  parentId: string | null
  children: string[]
  props: Record<string, unknown>
  style: LayoutStyle
  actions?: ActionConfig[]
}
