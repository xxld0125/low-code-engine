export type FieldType = 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'json' | 'select'

/**
 * The configuration rules for a field relationship.
 * Currently supports 1:N (One-to-Many).
 * For a "HasMany" (One-to-Many) from the parent side, it is virtually defined.
 * For a "BelongsTo" from the child side, it creates a physical FK.
 */
export interface RelationConfig {
  type: 'hasOne' | 'hasMany' | 'belongsTo'
  targetModelId: string // The ID of the related model
  foreignKey?: string // e.g., 'customer_id' (only relevant for belongsTo)
}

export interface ValidationRules {
  required?: boolean
  unique?: boolean
  regex?: string
  min?: number
  max?: number
}

export interface Field {
  id: string
  name: string // Display name, e.g., "Customer Name"
  key: string // Physical column name, e.g., "customer_name"
  type: FieldType
  description?: string
  defaultValue?: unknown
  options?: string[] // For 'select' type
  validation?: ValidationRules
  relation?: RelationConfig // If validation.relation is present, type might be 'uuid' physically but 'reference' logically
  isSystem?: boolean // id, created_at, etc.
}

export interface DataModel {
  id: string
  name: string // Display name, e.g., "Sales Order"
  description?: string
  table_name: string // Physical table name, e.g., "sales_orders". Usually snake_case of name or defined separately.
  fields: Field[]
  created_at?: string
  updated_at?: string
}

export interface SchemaDiff {
  modelId: string
  ops: SchemaOp[]
}

export type SchemaOp =
  | { type: 'add_field'; field: Field }
  | { type: 'remove_field'; fieldKey: string }
  | { type: 'modify_field'; fieldKey: string; changes: Partial<Field> }
  | { type: 'add_model'; model: DataModel }
  | { type: 'remove_model'; modelId: string }
