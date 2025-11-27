import { z } from 'zod'

// Matches ComponentType in types/editor.ts
const ComponentTypeEnum = z.enum(['Container', 'Button', 'Text', 'Table', 'Form', 'Modal'])

// Matches ActionType in types/editor.ts
const ActionTypeEnum = z.enum([
  'OPEN_MODAL',
  'CLOSE_MODAL',
  'SUBMIT_FORM',
  'REFRESH_TABLE',
  'NAVIGATE',
  'SHOW_TOAST',
])

const ActionPayloadSchema = z.union([
  z.object({ modalId: z.string() }).strict(),
  z.object({ url: z.string() }).strict(),
  z.object({ type: z.enum(['success', 'error', 'info']), message: z.string() }).strict(),
  z.object({ tableId: z.string().optional() }).strict(),
  z.object({ formId: z.string().optional() }).strict(),
  z.record(z.string(), z.unknown()),
])

const ActionConfigSchema = z.object({
  trigger: z.enum(['onClick', 'onSubmit']),
  type: ActionTypeEnum,
  payload: ActionPayloadSchema,
})

// Recursive schema for ComponentNode
export const ComponentNodeSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: ComponentTypeEnum,
    parentId: z.string().nullable(),
    children: z.array(z.string()),
    props: z.record(z.string(), z.unknown()),
    style: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
    actions: z.array(ActionConfigSchema).optional(),
  })
)

export const PageSchema = z.object({
  rootId: z.string(),
  components: z.record(z.string(), ComponentNodeSchema),
})

export type PageSchemaType = z.infer<typeof PageSchema>
