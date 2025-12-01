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

  // 3. 保存状态
  isDirty: boolean // 是否有未保存的更改

  // Actions
  setComponents: (components: Record<string, ComponentNode>) => void
  setIsDirty: (isDirty: boolean) => void
  addComponent: (parentId: string, component: ComponentNode, index?: number) => void
  removeComponent: (id: string) => void
  updateComponentProps: (id: string, props: Record<string, unknown>) => void
  updateComponentStyle: (id: string, style: LayoutStyle) => void
  selectComponent: (id: string | null) => void
  moveComponent: (id: string, newParentId: string, index: number) => void
  reorderChildren: (parentId: string, newChildren: string[]) => void
  updateComponentActions: (id: string, actions: ActionConfig[]) => void
}
```

## 3. 重点交互逻辑

### 3.1 拖拽实现 (dnd-kit)

采用 `dnd-kit` 实现，分为两个阶段：

1.  **从侧边栏拖入画布**:
    - 侧边栏 Item 使用 `useDraggable`。
    - 画布容器使用 `useDroppable`。
    - `onDragEnd` 检测是否拖入有效区域，若是则调用 `addComponent`。
    - **优化**：使用自定义 `snapSidebarItemToCursor` modifier，使 DragOverlay 居中对齐鼠标。
    - **优化**：移除侧边栏组件的 `transform`，拖拽时原位不动，仅显示半透明状态。
2.  **画布内排序**:
    - 画布内组件使用 `useSortable`。
    - `onDragOver` 实时计算插入位置，使用 `elementsFromPoint` 增强碰撞检测。
    - `onDragEnd` 调用 `moveComponent` 更新树结构。
    - **优化**：禁用组件的 `transform`，拖拽时保持原位不动，避免 Layout Shift。
    - **视觉反馈**：通过 `DragOverlay`（绿色标签）和 `DropIndicator`（绿色线）提供统一的拖拽反馈。

#### 3.1.1 拖拽状态管理 (DragDropContext)

全局拖拽状态通过 `DragDropProvider` 管理：

```typescript
// components/editor/drag-drop-context.tsx
interface DropTargetState {
  type: 'container' | 'insertion-point' // 放入容器 or 插入两组件之间
  targetId: string // 目标组件 ID
  position?: 'before' | 'after' // 插入位置（仅 insertion-point）
  indicatorRect: IndicatorRect // DropIndicator 渲染坐标
}

interface DragDropContextValue {
  dropTarget: DropTargetState | null
  setDropTarget: (target: DropTargetState | null) => void
  isDragging: boolean
  setIsDragging: (dragging: boolean) => void
  mousePosition: { x: number; y: number }
}
```

#### 3.1.2 智能插入点算法 (findClosestInsertionPoint)

基于 `event.over` 和 `elementsFromPoint` 的混合方案：

1. **边缘检测**：鼠标在组件边缘（12px）时，判定为"插入前/后"。
2. **中心区域**：鼠标在组件中心时，判定为"放入容器内部"。
3. **父级提升**：鼠标在非容器组件中心时，自动提升到父容器。
4. **循环引用检测**：禁止将组件移动到其自身的后代节点内。

详见 `docs/tech/drag-drop-system-refactor.md` 完整设计文档。

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

### 4.4 未保存更改提醒 (Unsaved Changes Warning)

保护用户数据，防止意外丢失编辑内容。

#### 实现方案

1. **状态管理 (EditorStore)**：

   ```typescript
   interface EditorState {
     isDirty: boolean // 是否有未保存更改
     setIsDirty: (isDirty: boolean) => void
   }
   ```

2. **自动标记**：所有修改操作（addComponent、removeComponent、updateComponentProps、updateComponentStyle、moveComponent、updateComponentActions）执行后自动设置 `isDirty: true`。

3. **自动清除**：
   - `setComponents`（加载页面数据）时设置 `isDirty: false`。
   - Save 按钮成功后调用 `setIsDirty(false)`。

4. **浏览器事件监听**：

   ```typescript
   // hooks/use-unsaved-changes-warning.ts
   export function useUnsavedChangesWarning(isDirty: boolean) {
     useEffect(() => {
       const handleBeforeUnload = (event: BeforeUnloadEvent) => {
         if (isDirty) {
           event.preventDefault()
           event.returnValue = '' // 触发浏览器默认确认对话框
         }
       }
       window.addEventListener('beforeunload', handleBeforeUnload)
       return () => window.removeEventListener('beforeunload', handleBeforeUnload)
     }, [isDirty])
   }
   ```

5. **集成到编辑器**：在 `EditorLayout` 中使用 `useUnsavedChangesWarning(isDirty)` 启用监听。

#### 用户体验

- **有未保存更改**：刷新/关闭页面时，浏览器弹出标准确认对话框："确定要离开此页面吗？您所做的更改可能不会保存。"
- **已保存**：正常刷新，无提示。
