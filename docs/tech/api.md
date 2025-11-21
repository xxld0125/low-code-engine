# API 接口设计

本系统不开发独立的后端 API 服务，而是通过 Service 层封装 Supabase Client 的调用。以下定义 Service 层的方法签名。

## 1. 页面管理服务 (`PageService`)

文件路径: `lib/services/page-service.ts`

| 方法名             | 参数                                   | 返回值            | 描述                                      |
| :----------------- | :------------------------------------- | :---------------- | :---------------------------------------- |
| `getPages`         | 无                                     | `Promise<Page[]>` | 获取当前登录用户的所有页面列表。          |
| `getPage`          | `id: string`                           | `Promise<Page>`   | 根据 ID 获取页面详情（包含 Schema）。     |
| `getPageBySlug`    | `slug: string`                         | `Promise<Page>`   | 根据 Slug 获取页面（用于 Runtime 渲染）。 |
| `createPage`       | `data: { name: string, slug: string }` | `Promise<Page>`   | 创建新页面，Schema 默认为空对象。         |
| `updatePageSchema` | `id: string, schema: ComponentNode`    | `Promise<void>`   | 更新页面的组件配置。                      |
| `deletePage`       | `id: string`                           | `Promise<void>`   | 删除页面。                                |

**类型定义**:

```typescript
interface Page {
  id: string
  user_id: string
  name: string
  slug: string
  schema: ComponentNode
  created_at: string
  updated_at: string
}
```

## 2. Schema 元数据服务 (`SchemaService`)

文件路径: `lib/services/schema-service.ts`
用于编辑器中获取数据库表结构，辅助 Form 组件自动生成。

| 方法名            | 参数                | 返回值                        | 描述                                      |
| :---------------- | :------------------ | :---------------------------- | :---------------------------------------- |
| `getTables`       | 无                  | `Promise<string[]>`           | 获取 `public` schema 下所有用户表的表名。 |
| `getTableColumns` | `tableName: string` | `Promise<ColumnDefinition[]>` | 获取指定表的字段定义。                    |

**类型定义**:

```typescript
interface ColumnDefinition {
  name: string // 字段名
  type: string // 数据类型 (text, int4, bool, etc.)
  isNullable: boolean // 是否可为空
  defaultValue: any // 默认值
  isPrimaryKey: boolean // 是否主键
}
```

## 3. 通用数据服务 (`DataService`)

文件路径: `lib/services/data-service.ts`
用于 Runtime 组件（Table, Form）进行实际的数据读写。

| 方法名           | 参数                                       | 返回值                                    | 描述                                 |
| :--------------- | :----------------------------------------- | :---------------------------------------- | :----------------------------------- | -------------- |
| `fetchTableData` | `tableName: string, options: QueryOptions` | `Promise<{ data: any[], count: number }>` | 通用查询接口，支持分页、排序、筛选。 |
| `insertRecord`   | `tableName: string, data: any`             | `Promise<any>`                            | 插入单条记录。                       |
| `updateRecord`   | `tableName: string, id: string             | number, data: any`                        | 更新单条记录。                       |
| `deleteRecord`   | `tableName: string, id: string             | number`                                   | `Promise<void>`                      | 删除单条记录。 |

**类型定义**:

```typescript
interface QueryOptions {
  page?: number // 页码 (从 1 开始)
  pageSize?: number // 每页条数
  orderBy?: string // 排序字段
  orderDir?: 'asc' | 'desc' // 排序方向
  filters?: Record<string, any> // 筛选条件
}
```
