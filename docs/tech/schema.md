# 组件 Schema 设计

## 1. 组件节点定义 (`ComponentNode`)

这是系统中流转的核心数据结构。

```typescript
interface ComponentNode {
  id: string // 唯一标识符 (UUID)
  type: ComponentType // 组件类型枚举
  parentId: string | null // 父节点 ID
  children: string[] // 子节点 ID 列表 (有序)

  // 组件特有属性 (不同类型组件结构不同)
  props: Record<string, any>

  // 布局样式 (严格限制为布局相关，禁止颜色/字体)
  style: LayoutStyle

  // 交互动作配置
  actions?: ActionConfig[]
}

// 组件类型枚举
type ComponentType =
  | 'Container' // 基础容器
  | 'Flex' // 弹性布局
  | 'Grid' // 网格布局
  | 'Button' // 按钮
  | 'Text' // 文本
  | 'Table' // 数据表格
  | 'Form' // 数据表单

// 布局样式定义
interface LayoutStyle {
  padding?: string // e.g., "16px"
  margin?: string // e.g., "0px 0px 16px 0px"
  width?: string // e.g., "100%", "500px"
  height?: string // e.g., "auto", "100%"
  display?: 'block' | 'flex' | 'grid'
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between'
  alignItems?: 'flex-start' | 'center' | 'flex-end'
  gap?: string // e.g., "8px"
}

// 交互动作配置
interface ActionConfig {
  trigger: 'onClick' | 'onSubmit' // 触发事件
  type: ActionType // 动作类型
  payload: any // 动作参数
}
```

## 2. 组件 Props 定义

### 2.1 容器类 (Container, Flex, Grid)

```typescript
interface ContainerProps {
  // 无特殊 Props，主要靠 style 控制
}

interface GridProps {
  columns: number // 列数，e.g., 2, 3, 4
  gap: number // 间距 px
}
```

### 2.2 文本 (Text)

```typescript
interface TextProps {
  content: string // 文本内容，支持 {{expression}}
  tag: 'h1' | 'h2' | 'h3' | 'p' | 'span' // HTML 标签
}
```

### 2.3 按钮 (Button)

```typescript
interface ButtonProps {
  text: string // 按钮文字
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' // shadcn 变体
  size: 'default' | 'sm' | 'lg' | 'icon' // shadcn 尺寸
  disabled?: boolean
}
```

### 2.4 表格 (Table)

```typescript
interface TableProps {
  tableName: string // 绑定的 Supabase 表名
  pageSize: number // 每页条数
  columns: TableColumn[] // 列配置
}

interface TableColumn {
  field: string // 数据库字段名
  header: string // 表头显示文字
  width?: number // 列宽
  visible: boolean // 是否显示
  format?: string // 格式化字符串 (可选)
}
```

### 2.5 表单 (Form)

```typescript
interface FormProps {
  tableName: string // 绑定的 Supabase 表名
  mode: 'insert' | 'update' // 模式
  fields: FormField[] // 字段配置
}

interface FormField {
  name: string // 数据库字段名
  label: string // 表单标签
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' // 输入控件类型
  required: boolean // 是否必填
  placeholder?: string
}
```

## 3. 交互动作枚举 (`ActionType`)

```typescript
enum ActionType {
  OPEN_MODAL = 'OPEN_MODAL', // 打开弹窗
  CLOSE_MODAL = 'CLOSE_MODAL', // 关闭弹窗
  SUBMIT_FORM = 'SUBMIT_FORM', // 提交表单
  REFRESH_TABLE = 'REFRESH_TABLE', // 刷新表格
  NAVIGATE = 'NAVIGATE', // 页面跳转
  SHOW_TOAST = 'SHOW_TOAST', // 显示提示
}

// Payload 示例
// OPEN_MODAL: { modalId: "modal-123" }
// NAVIGATE: { url: "/dashboard" }
// SHOW_TOAST: { type: "success", message: "操作成功" }
```
