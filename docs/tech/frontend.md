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
