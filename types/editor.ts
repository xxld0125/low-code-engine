export type ComponentType = 'Container' | 'Flex' | 'Grid' | 'Button' | 'Text' | 'Table' | 'Form'

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

export interface ActionConfig {
  trigger: 'onClick' | 'onSubmit'
  type: string
  payload: unknown
}

export interface ComponentNode {
  id: string
  type: ComponentType
  parentId: string | null
  children: string[]
  props: Record<string, unknown>
  style: LayoutStyle
  actions?: ActionConfig[]
}
