import { DataModel, Field } from '@/types/data-engine'

export type SQLOperation = string

export function generateSchemaDiff(newModel: DataModel, oldModel?: DataModel): SQLOperation[] {
  const ops: SQLOperation[] = []
  const tableName = newModel.table_name

  // 1. Table Level Changes
  if (!oldModel) {
    // New Table
    // We don't create table here usually if we assume metadata-first,
    // but typically we want to create the physical table now.
    // Let's assume we Create Table if it doesn't exist.
    const columns = newModel.fields.map((f) => defineColumn(f)).join(',\n  ')
    ops.push(
      `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  created_at timestamptz DEFAULT now(),\n  updated_at timestamptz DEFAULT now(),\n  ${columns}\n);`
    )
    ops.push(`COMMENT ON TABLE "${tableName}" IS '${newModel.description || ''}';`)
    // Add comments for columns
    newModel.fields.forEach((f) => {
      if (f.description) {
        ops.push(`COMMENT ON COLUMN "${tableName}"."${f.key}" IS '${f.description}';`)
      }
    })
    return ops
  }

  // 2. Renames (Not customized in UI yet, assumption is table name immutable for MVP or we handle it)
  // if (newModel.table_name !== oldModel.table_name) ...

  // 3. Field Changes
  const newFieldsMap = new Map(newModel.fields.map((f) => [f.id, f]))
  const oldFieldsMap = new Map(oldModel.fields.map((f) => [f.id, f]))

  // 3.1 Added Fields
  newModel.fields.forEach((field) => {
    if (!oldFieldsMap.has(field.id)) {
      ops.push(`ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS ${defineColumn(field)};`)
      if (field.description) {
        ops.push(`COMMENT ON COLUMN "${tableName}"."${field.key}" IS '${field.description}';`)
      }
    }
  })

  // 3.2 Modified Fields
  newModel.fields.forEach((field) => {
    const oldField = oldFieldsMap.get(field.id)
    if (oldField) {
      // Check for changes
      // 1. Rename Key
      if (field.key !== oldField.key) {
        ops.push(`ALTER TABLE "${tableName}" RENAME COLUMN "${oldField.key}" TO "${field.key}";`)
      }

      const currentKey = field.key // Use new key if renamed

      // 2. Type Change
      if (field.type !== oldField.type) {
        const sqlType = getSQLType(field.type)
        // Type casting hint is tricky, PostgreSQL might fail.
        // We add 'USING "${currentKey}"::${sqlType}' generic strategy or let it fail for complex changes.
        ops.push(
          `ALTER TABLE "${tableName}" ALTER COLUMN "${currentKey}" TYPE ${sqlType} USING "${currentKey}"::${sqlType};`
        )
      }

      // 3. Nullable Change
      const isRequired = field.validation?.required
      const wasRequired = oldField.validation?.required
      if (isRequired !== wasRequired) {
        if (isRequired) {
          ops.push(`ALTER TABLE "${tableName}" ALTER COLUMN "${currentKey}" SET NOT NULL;`)
        } else {
          ops.push(`ALTER TABLE "${tableName}" ALTER COLUMN "${currentKey}" DROP NOT NULL;`)
        }
      }

      // 4. Default Value (omitted for MVP)

      // 5. Description
      if (field.description !== oldField.description) {
        ops.push(
          `COMMENT ON COLUMN "${tableName}"."${currentKey}" IS '${field.description || ''}';`
        )
      }
    }
  })

  // 3.3 Deleted Fields
  oldModel.fields.forEach((field) => {
    if (!newFieldsMap.has(field.id)) {
      // Safety: In MVP we drop. In production we might archive or warn.
      ops.push(`ALTER TABLE "${tableName}" DROP COLUMN "${field.key}";`)
    }
  })

  return ops
}

function defineColumn(field: Field): string {
  const type = getSQLType(field.type)
  const nullable = field.validation?.required ? 'NOT NULL' : 'NULL'
  // Default values can be handled here if added to Field model
  return `"${field.key}" ${type} ${nullable}`
}

function getSQLType(jsType: string): string {
  switch (jsType) {
    case 'text':
      return 'text'
    case 'number':
      return 'numeric' // or integer/float based on finer config
    case 'boolean':
      return 'boolean'
    case 'date':
      return 'timestamptz'
    case 'json':
      return 'jsonb'
    case 'select':
      return 'text' // Store enum value as text
    case 'uuid':
      return 'uuid'
    // Relations typically store UUIDs if single, or handle via junction tables if many-to-many.
    // For 1:N (BelongsTo), it's a UUID column.
    default:
      return 'text'
  }
}
