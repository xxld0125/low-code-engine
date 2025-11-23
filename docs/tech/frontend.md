# 前端设计

## 1. 路由结构 (App Router)

```
app/
├── (auth)/                 # 认证相关路由组
│   ├── login/page.tsx      # 登录页
│   └── register/page.tsx   # 注册页
├── (main)/                 # 主应用路由组 (需登录)
│   ├── dashboard/page.tsx  # 仪表盘 (页面列表)
│   ├── editor/
│   │   └── [pageId]/page.tsx # 编辑器核心页面
│   └── layout.tsx          # 主布局 (包含 Header, UserMenu)
├── page/
│   └── [pageId]/page.tsx   # 运行时预览页 (独立布局)
└── layout.tsx              # 根布局 (Providers)
```

## 2. 状态管理 (Zustand Store)

### `EditorStore`

管理编辑器内的所有状态，是前端最核心的数据结构。

```typescript
interface EditorState {
  // 1. 组件树数据
  components: Record<string, ComponentNode> // 扁平化存储，ID 为 Key
  rootId: string // 根容器 ID

  // 2. 选中状态
  selectedId: string | null // 当前选中的组件 ID

  // 3. 拖拽状态
  draggedId: string | null // 当前正在拖拽的组件 ID

  // 4. 剪贴板
  clipboard: ComponentNode | null // 复制的组件数据

  // Actions
  addComponent: (parentId: string, component: ComponentNode, index?: number) => void
  removeComponent: (id: string) => void
  updateComponentProps: (id: string, props: Partial<ComponentNode['props']>) => void
  updateComponentStyle: (id: string, style: Partial<ComponentNode['style']>) => void
  selectComponent: (id: string | null) => void
  moveComponent: (dragId: string, targetId: string, position: 'before' | 'after' | 'inside') => void
  copyComponent: (id: string) => void
  pasteComponent: (parentId: string) => void
}
```

## 3. 重点交互逻辑

### 3.1 拖拽实现 (dnd-kit)

采用 `dnd-kit` 实现，分为两个阶段：

1.  **从侧边栏拖入画布**:
    - 侧边栏 Item 使用 `useDraggable`。
    - 画布容器使用 `useDroppable`。
    - `onDragEnd` 检测是否拖入有效区域，若是则调用 `addComponent`。
2.  **画布内排序**:
    - 画布内组件同时使用 `useDraggable` 和 `useDroppable` (或 `SortableContext`)。
    - `onDragOver` 实时计算插入位置指示线。
    - `onDragEnd` 调用 `moveComponent` 更新树结构。

### 3.2 组件树渲染

为了性能优化，不使用递归组件，而是采用扁平化数据结构 + 递归渲染器。

```tsx
// 伪代码示例
const ComponentRenderer = ({ nodeId }) => {
  const component = useEditorStore((state) => state.components[nodeId])
  const Component = ComponentRegistry[component.type]

  return (
    <Component {...component.props} style={component.style}>
      {component.children.map((childId) => (
        <ComponentRenderer key={childId} nodeId={childId} />
      ))}
    </Component>
  )
}
```

### 3.3 属性面板双向绑定

1.  监听 `selectedId` 变化。
2.  根据 `selectedId` 获取当前组件的 `props` 和 `style`。
3.  根据组件 `type` 渲染对应的配置表单（如 Table 显示列配置，Text 显示内容输入）。
4.  表单变更 (`onChange`) 实时调用 `updateComponentProps`。

### 3.4 组件树一致性维护 (Tree Consistency)

由于采用了**扁平化存储 (`components` Map)** 与 **树状引用 (`children` Array)** 相结合的数据结构，在执行增删改操作时必须严格维护数据一致性。

#### 1. 移动组件 (`moveComponent`) 的原子操作

当组件从位置 A 移动到位置 B 时，必须**原子化**地执行以下三个步骤，缺一不可：

1.  **更新旧父节点**: 从 `oldParent.children` 数组中移除该组件 ID。
2.  **更新新父节点**: 将该组件 ID 插入到 `newParent.children` 的指定 `index` 位置。
3.  **更新自身**: 将组件的 `parentId` 字段指向 `newParentId`。

#### 2. 删除组件 (`removeComponent`) 的递归清理

删除组件时，仅从父节点的 `children` 中移除 ID 是不够的，必须**递归清理**所有后代节点，防止 Map 中残留“孤儿节点”导致内存泄漏。

```typescript
// 伪代码逻辑
function deleteRecursive(nodeId: string, state: EditorState) {
  const node = state.components[nodeId]
  // 1. 递归删除所有子节点
  node.children.forEach((childId) => deleteRecursive(childId, state))
  // 2. 删除自身
  delete state.components[nodeId]
}
```

#### 3. 循环引用检测

在执行 `moveComponent` (尤其是 `inside` 模式) 前，必须检查**目标父节点是否为当前拖拽节点的后代**。如果是，则禁止移动，防止死循环导致应用崩溃。

## 4. 重点组件设计

### 4.1 画布容器 (Canvas)

- **职责**: 提供拖拽放置区域，渲染组件树，处理选中点击事件。
- **实现**: 一个绝对定位的 `div`，内部包含 `RootContainer`。

### 4.2 属性面板 (PropertyPanel)

- **职责**: 编辑当前选中组件的属性。
- **结构**:
  - **Tab 1: 属性 (Props)**: 组件特有属性 (如 Table 的 columns)。
  - **Tab 2: 样式 (Style)**: 通用布局属性 (Padding, Margin, Align)。
  - **Tab 3: 交互 (Interaction)**: 绑定点击事件动作。

### 4.3 表单自动生成逻辑 (Form Auto-Generation)

在属性面板配置 `Form` 组件时，提供辅助工具：

1.  **触发入口**: 当用户在属性面板选择了 `tableName` 后，显示 "Auto-Fill Fields" (自动填充字段) 按钮。
2.  **执行逻辑**:
    - 调用 `SchemaService.getTableColumns(tableName)` 获取 Supabase 表结构。
    - 将返回的列定义转换为 `FormField` 对象列表。
    - **快照式更新**: 将生成的字段列表**覆盖**当前组件的 `fields` 属性。
3.  **后续编辑**: 生成后，用户可以自由修改、排序或删除字段，与原始 Schema 解耦。
