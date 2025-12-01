# 拖拽系统重构技术文档

## 1. 问题背景

在低代码编辑器的第 7 阶段测试中，发现了一个关键的用户体验问题：

**核心问题**：当画板中有两个相邻的 Container 组件时，想将一个新的组件放入已有 Container 组件中时，无法操作成功。组件要么拖入到上一个 Container 组件中，要么拖入下一个 Container 组件中，无法精确控制。

**用户期望**：

1. 支持将组件放入已有 Container 组件内部
2. 支持将组件放入两个相邻 Container 组件之间

## 1.1 期望的拖拽效果

### 场景一：拖入空容器

- **操作**：将组件从左侧面板拖拽到一个空的 Container 上
- **视觉反馈**：Container 显示蓝色边框高亮（表示"放入内部"）
- **结果**：组件成为 Container 的子元素

### 场景二：拖入已有内容的容器

- **操作**：将组件拖拽到一个已有子元素的 Container 上
- **视觉反馈**：
  - 鼠标在 Container 内部空白区域（Padding）或子元素中间区域 → 显示蓝色边框（放入内部，Append）
  - 鼠标在子元素的上/下边缘 → 显示蓝色线条（插入到子元素前/后）
- **结果**：组件成为 Container 的子元素，位置取决于具体操作

### 场景三：插入两个相邻容器之间

- **操作**：将组件拖拽到两个相邻 Container 的缝隙处
- **视觉反馈**：在两个 Container 之间显示蓝色线条（表示"插入此处"）
- **结果**：组件成为两个 Container 的兄弟节点，插入到指定位置

### 场景四：在容器内重新排序

- **操作**：拖拽 Container 内的子组件到另一个位置
- **视觉反馈**：目标位置显示蓝色线条
- **结果**：子组件在同一 Container 内移动位置

### 视觉反馈规范

| 操作意图      | 指示器类型 | 颜色    | 形状             |
| ------------- | ---------- | ------- | ---------------- |
| 放入容器内部  | 蓝框       | #16AA98 | 容器边框高亮     |
| 插入组件前/后 | 蓝线       | #16AA98 | 4px 高的水平线条 |
| 无效放置区域  | 无         | -       | 不显示任何指示器 |

## 2. 问题根因分析

### 2.1 原始实现的缺陷

原始的拖拽逻辑位于 `components/editor/editor-layout.tsx`，使用 `dnd-kit` 库实现。核心问题在于 `handleDragEnd` 函数中的判定逻辑：

```typescript
// 原始逻辑：仅通过"容器是否为空"来判断是放入内部还是放在旁边
if (overId === rootId || overComponent.children.length === 0) {
  // 放入内部
  parentId = overId
} else if (overComponent.parentId) {
  // 放入旁边 (强制作为兄弟节点)
  parentId = overComponent.parentId
}
```

**问题**：这种"一刀切"的逻辑无法区分用户的真实意图。

### 2.2 碰撞检测机制的局限性

`dnd-kit` 的 `pointerWithin` 碰撞检测只能告诉我们"鼠标在哪个元素上"，但无法区分：

- 用户是想把组件放入容器**内部**
- 还是想把组件插入到容器**旁边**（作为兄弟节点）

### 2.3 物理层级遮挡问题 (Occlusion)

当子组件（如 Text）填满父容器（Container）时，鼠标物理上无法接触到 Container 的背景。系统判定 `over` 永远是子组件，导致用户无法触发"放入容器"的操作。

## 3. 解决方案设计

### 3.1 设计思路：基于插入点的智能判定

借鉴专业低代码平台（Webflow, Framer, Retool）的设计，引入**"最近插入点（Nearest Insertion Point）"**算法：

1. **中心区域响应**：鼠标位于容器的中心区域时，判定为"放入内部"
2. **边缘区域响应**：鼠标位于容器的边缘时，判定为"放入旁边"
3. **视觉反馈分离**：使用独立的 `DropIndicator` 组件渲染高亮，避免遮挡

### 3.2 核心数据结构

```typescript
// components/editor/drag-drop-context.tsx
interface DropTargetState {
  type: 'container' | 'insertion-point' // 放入容器内部 or 插入两个组件之间
  targetId: string // 目标组件ID
  position?: 'before' | 'after' // 仅 insertion-point 需要
  indicatorRect: IndicatorRect // 用于绘制高亮的坐标
}
```

## 4. 技术实现方案

### 4.1 方案一：调整边缘阈值

**实现**：将触发"插入到旁边"的边缘判定区域从 20% 缩小为固定 5px。

```typescript
const EDGE_THRESHOLD = 5
const nearTop = relativeY < EDGE_THRESHOLD
const nearBottom = relativeY > overRect.height - EDGE_THRESHOLD
```

**效果**：部分改善，但仍无法解决子元素填满容器的问题。

### 4.2 方案二：增加容器最小高度

**实现**：将 Container 的设计态最小高度从 50px 增加到 100px。

```typescript
// components/editor/component-renderer.tsx
isContainer && 'min-h-[100px] min-w-[50px] p-2'

// components/renderer/layout-components.tsx
className={cn('min-h-[100px] w-full p-2 transition-all', className)}
```

**效果**：增大了命中区域，但根本问题未解决。

### 4.3 方案三：优化拖拽源视觉表现

**实现**：将拖拽时跟随鼠标的元素从完整组件改为小胶囊标签。

```tsx
// DragOverlay 内容
<div className="pointer-events-none flex items-center gap-2 rounded-md bg-[#16AA98] px-3 py-2 text-white opacity-90 shadow-xl">
  <Icon className="h-4 w-4" />
  <span className="text-sm font-medium">{activeDragItem.type}</span>
</div>
```

**效果**：消除了视觉遮挡，用户可以清晰看到目标区域。

### 4.4 方案四：父级提升逻辑 (Bubble Up)

**实现**：当悬停在非容器组件（如 Text）的中间区域时，自动将目标提升为其父容器。

```typescript
// 如果在非容器组件的中间区域，且父级是容器
const SIBLING_ZONE = Math.min(15, overRect.height * 0.3)

if (distToTop > SIBLING_ZONE && distToBottom > SIBLING_ZONE) {
   if (overComponent.parentId) {
      const parentElement = document.querySelector(`[data-component-id="${overComponent.parentId}"]`)
      if (parentElement) {
         const parentRect = parentElement.getBoundingClientRect()
         const parentComponent = components[overComponent.parentId]

         if (parentComponent && ['Container', 'Grid', 'Flex', 'Form', 'Modal'].includes(parentComponent.type)) {
            return {
              type: 'container',
              targetId: parentComponent.id,
              indicatorRect: { ... }
            }
         }
      }
   }
}
```

**效果**：理论上可行，但实际测试中仍存在问题。

### 4.5 方案五：优化占位符尺寸

**实现**：将空容器内的占位符 `Drop items here` 从固定小尺寸改为撑满整个容器。

```typescript
// 原始
<div className="flex min-h-[20px] items-center justify-center ...">

// 修改后
<div className="flex h-full w-full min-h-[100px] items-center justify-center ...">
```

**效果**：改善了空容器的放置体验，但有内容的容器仍存在问题。

### 4.6 方案六：Multi-Container 模式（dnd-kit 双重注册）

**设计思路**：让容器组件同时注册为 `useSortable`（可排序项）和 `useDroppable`（放置目标），这样碰撞检测能同时识别容器本身。

**实现**：

```typescript
// components/editor/component-renderer.tsx
const isContainerType = ['Container', 'Form', 'Modal'].includes(component.type)

// Sortable hook (原有)
const { setNodeRef: setSortableRef, ... } = useSortable({ id: componentId })

// Droppable hook (新增)
const { setNodeRef: setDroppableRef } = useDroppable({
  id: `droppable-${componentId}`,
  disabled: !isContainerType,
  data: { isContainer: true },
})

// 合并两个 ref
const setNodeRef = useCallback((node) => {
  setSortableRef(node)
  if (isContainerType) setDroppableRef(node)
}, [setSortableRef, setDroppableRef, isContainerType])
```

同时修改碰撞检测，优先识别 `droppable-*` 开头的容器碰撞：

```typescript
const customCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)

  // 分离容器碰撞和普通碰撞
  const containerCollisions = pointerCollisions.filter((c) =>
    (c.id as string).startsWith('droppable-')
  )

  // 优先返回容器碰撞
  if (containerCollisions.length > 0) {
    return [containerCollisions[containerCollisions.length - 1]]
  }
  return pointerCollisions
}
```

**测试发现的问题**：

1. **碰撞检测未返回容器 droppable**：日志显示 `overId` 始终是子元素（如 `Text_2`）或 `root`，从未出现 `droppable-Container_1`

2. **快速拖入可以，慢速拖入不行**：
   - 快速拖入时，指针可能直接跳过子元素区域
   - 慢速拖入时，`handleDragOver` 频繁触发，始终返回子元素

3. **指针位置计算问题**：使用 `event.delta` 计算的位置不够实时，改用全局 `mousemove` 监听后仍有问题

4. **合成碰撞无效**：尝试在碰撞检测中使用 `elementsFromPoint` 创建合成碰撞，但 dnd-kit 的 `over` 选择逻辑仍返回错误目标

**根因分析**：

- `useSortable` 内部已经创建了一个 droppable，与新增的 `useDroppable` 绑定同一 DOM 节点可能产生冲突
- ref 合并的条件判断 (`if (isContainerType)`) 可能导致 droppable 注册时机不正确
- dnd-kit 的碰撞检测机制本身无法正确处理被子元素遮挡的父容器

**结论**：Multi-Container 模式在当前场景下不可行，需要完全绕过 dnd-kit 的碰撞检测。

### 4.7 方案七：完全绕过碰撞检测（elementsFromPoint）

**设计思路**：不依赖 dnd-kit 的 `event.over` 返回值，直接使用 `document.elementsFromPoint` 获取指针下所有元素，手动确定放置目标。

**核心算法**：

```typescript
const findClosestInsertionPoint = () => {
  const pointerX = mousePositionRef.current.x
  const pointerY = mousePositionRef.current.y

  // 1. 获取指针下所有元素（从最上层到最下层）
  const elements = document.elementsFromPoint(pointerX, pointerY)

  // 2. 找到所有有 data-component-id 的组件元素
  const componentElements = []
  for (const el of elements) {
    const componentId = el.getAttribute('data-component-id')
    if (componentId && components[componentId]) {
      componentElements.push({ element: el, componentId })
    }
  }

  // 3. 找到最深的容器组件
  const deepestContainer = componentElements.find(({ componentId }) =>
    ['Container', 'Form', 'Modal'].includes(components[componentId].type)
  )

  // 4. 找到最浅的非容器组件（可能的插入点）
  const shallowItem = componentElements[0]

  // 5. 根据相对位置判断放置意图
  if (shallowItem && !isContainer(shallowItem.componentId)) {
    const rect = shallowItem.element.getBoundingClientRect()
    const relativeY = pointerY - rect.top
    const EDGE_THRESHOLD = 8

    // 在子元素边缘 → 插入前后
    if (relativeY < EDGE_THRESHOLD) {
      return { type: 'insertion-point', targetId: shallowItem.componentId, position: 'before' }
    }
    if (relativeY > rect.height - EDGE_THRESHOLD) {
      return { type: 'insertion-point', targetId: shallowItem.componentId, position: 'after' }
    }

    // 在子元素中间 → 放入父容器
    if (deepestContainer) {
      return { type: 'container', targetId: deepestContainer.componentId }
    }
  }

  // 6. 直接在容器上 → 放入容器
  if (deepestContainer) {
    return { type: 'container', targetId: deepestContainer.componentId }
  }

  return null
}
```

**实际实现**：已实现并测试

**测试发现的问题**：

1. **DragOverlay 遮挡问题**：
   - `elementsFromPoint` 返回的是**视觉上**在该点的所有元素
   - DragOverlay（拖拽跟随的小胶囊）会出现在返回列表中
   - 这些元素没有 `data-component-id`，导致 `componentHits` 可能为空

2. **Root Canvas 没有 `data-component-id`**：
   - Canvas 使用 `useDroppable` 注册，ID 是 `rootId`
   - 但 Canvas 的 DOM 元素没有 `data-component-id` 属性
   - 所以 `elementsFromPoint` 找不到 root，导致拖入空画布失效

3. **回退逻辑不可靠**：

   ```typescript
   if (componentHits.length === 0) {
     const rootElement =
       document.querySelector(`[data-component-id="${rootId}"]`) ||
       document.querySelector('.min-h-\\[800px\\]') // CSS 选择器转义问题
   }
   ```

   - 第一个选择器找不到（root 没有这个属性）
   - 第二个选择器的 CSS 转义可能不正确

4. **完全丢弃了 dnd-kit 的碰撞检测结果**：

   ```typescript
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   (_event: DragOverEvent): DropTargetState | null => {
   ```

   - 完全忽略 `event.over` 是错误的
   - `event.over` 对于 sidebar → canvas 的拖拽是有效的
   - `event.over` 已经正确识别了 root droppable

**结论**：方案七的纯 `elementsFromPoint` 方案不可行，导致基本的拖拽功能完全失效。

### 4.8 方案八：混合方案（推荐）

**设计思路**：结合 dnd-kit 的碰撞检测和 `elementsFromPoint` 的优势：

1. **以 `event.over` 为基础**：它能正确识别 root 和已注册的 droppable
2. **用 `elementsFromPoint` 增强**：当 `event.over` 返回子元素时，用它来查找父容器
3. **组合两者的优势**：
   - dnd-kit 负责基本的放置目标识别（特别是 root）
   - `elementsFromPoint` 负责解决"被遮挡的容器"问题

**核心逻辑**：

```typescript
const findClosestInsertionPoint = (event: DragOverEvent) => {
  const { over } = event

  // 1. 首先检查 dnd-kit 的 over 结果
  if (!over) return null

  const overId = over.id as string
  const pointerX = mousePositionRef.current.x
  const pointerY = mousePositionRef.current.y

  // 2. 如果 over 是 root，直接返回
  if (overId === rootId) {
    return { type: 'container', targetId: rootId, ... }
  }

  // 3. 使用 elementsFromPoint 增强：查找被遮挡的父容器
  const elements = document.elementsFromPoint(pointerX, pointerY)
  const containers = elements
    .map(el => el.getAttribute('data-component-id'))
    .filter(id => id && isContainer(id))

  // 4. 如果 over 是子元素，判断是插入旁边还是放入父容器
  const overComponent = components[overId]
  if (overComponent && !isContainer(overId)) {
    const overRect = over.rect
    const relativeY = pointerY - overRect.top
    const SIBLING_ZONE = Math.min(12, overRect.height * 0.3)

    // 在子元素中间 → 放入父容器（使用 elementsFromPoint 找到的容器）
    if (relativeY > SIBLING_ZONE && relativeY < overRect.height - SIBLING_ZONE) {
      const parentContainer = containers[0] // 最深的容器
      if (parentContainer) {
        return { type: 'container', targetId: parentContainer, ... }
      }
    }

    // 在子元素边缘 → 插入前后
    return { type: 'insertion-point', targetId: overId, position: ... }
  }

  // 5. over 是容器，判断是放入内部还是插入旁边
  // ...
}
```

**实现状态**：待实现

### 4.9 方案九：静态原位 + 仅指示器预览（最终采用）

**问题**：在画布内拖拽组件时，dnd-kit 默认的 `Sortable` 行为会导致：

1. 被拖拽的组件生成一个跟随鼠标的“鬼影”
2. 原位置保留占位符
3. 随着鼠标移动，dnd-kit 会尝试自动排序，导致周围的组件频繁发生位移（Layout Shift）
4. 这种位移会导致 `DropIndicator`（绿色横线）和组件实际预览位置不一致，造成视觉困扰

**解决方案**：

1. **保留 DragOverlay**：始终显示绿色的胶囊标签（`TEXT 1 X`）跟随鼠标，明确当前拖拽的对象。
2. **保留 DropIndicator**：始终显示绿色的横线或边框，指示松手后的确切位置。
3. **静止被拖拽组件**：
   - 在 `ComponentRenderer` 中，当 `isDragging` 为 true 时，**移除** `transform` 和 `transition`。
   - 设置 `opacity-50` 以指示该组件正在被操作。
   - **结果**：组件在视觉上留在原地不动，不会跟随鼠标，也不会挤占下方组件的位置。用户完全依赖 `DropIndicator` 来判断放置位置。

**代码修改**：

```typescript
// components/editor/component-renderer.tsx
const style = {
  // 关键：拖拽时不应用 transform，防止组件位移
  transform: isDragging ? undefined : CSS.Translate.toString(transform),
  transition,
  ...component.style,
}

// 样式处理
const editorClassName = cn(
  // ...
  isDragging && 'opacity-50' // 仅做半透明处理，不隐藏
  // ...
)
```

**效果**：完美解决了预览位置不一致和下方组件抖动的问题，体验最稳定。

## 5. 新增文件

| 文件路径                                  | 说明                                     |
| ----------------------------------------- | ---------------------------------------- |
| `components/editor/drag-drop-context.tsx` | 拖拽状态 Context，存储 `DropTargetState` |
| `components/editor/drop-indicator.tsx`    | 全局放置指示器组件，渲染蓝框/绿线        |

## 6. 修改文件

| 文件路径                                    | 修改内容                                            |
| ------------------------------------------- | --------------------------------------------------- |
| `components/editor/editor-layout.tsx`       | 重写拖拽逻辑，引入 `findClosestInsertionPoint` 算法 |
| `components/editor/component-renderer.tsx`  | 优化拖拽视觉表现，禁用拖拽位移，调整容器最小高度    |
| `components/renderer/layout-components.tsx` | 调整 Container 默认样式                             |
| `components/editor/header.tsx`              | 移除未使用的 Undo/Redo 图标导入                     |

## 7. 当前状态

**已实现**：

- [x] DragDropContext 状态管理
- [x] DropIndicator 视觉反馈组件
- [x] findClosestInsertionPoint 核心算法
- [x] 边缘检测阈值优化
- [x] 容器最小高度增加
- [x] 拖拽源视觉优化（小胶囊 + 自定义 Modifier 居中）
- [x] 父级提升逻辑
- [x] 占位符尺寸优化
- [x] 方案九：静态原位 + 仅指示器预览（已验证，体验最佳）

**已验证无效的方案**：

- 方案六（Multi-Container 模式）：ref 合并冲突，碰撞检测无法识别容器 droppable
- 方案七（纯 elementsFromPoint）：DragOverlay 遮挡、root 无 data-component-id、完全丢弃 event.over 导致基本拖拽失效
- 方案八（混合方案）：虽然逻辑正确，但 dnd-kit 的自动排序行为仍会导致视觉抖动

## 8. 调试日志分析

通过 `console.log` 调试发现：

```javascript
// 当拖拽 Text 到 Container 上时
DragOver: {
  overId: 'Text_1',        // 系统认为悬停在 Text_1 上
  type: 'Text',
  clientY: 253.1015625,
  rectTop: 244,
  rectHeight: 19.5,        // Text 高度只有 19.5px
  relativeY: 9.1015625,
  isContainer: false
}

// 移开一点后
DragOver: {
  overId: 'root',          // 穿透到了 Root
  type: 'Container',
  rectHeight: 800,
  isContainer: true
}
```

**关键发现**：

1. 日志中从未出现 Container 的 ID（除了 root）
2. 系统要么命中子元素（Text），要么穿透到 Root
3. 中间层的 Container 似乎被"跳过"了

## 9. 后续排查方向

1. **检查 `dnd-kit` 的 Droppable 注册机制**：
   - Container 是否正确注册为 Droppable？
   - `SortableContext` 是否干扰了父容器的命中？

2. **检查 DOM 结构层级**：
   - Container 的 `setNodeRef` 是否绑定在正确的 DOM 节点上？
   - 是否存在 `pointer-events` 相关的 CSS 问题？

3. **尝试自定义 Collision Detection**：
   - 完全绕过 `dnd-kit` 的默认碰撞检测
   - 使用 `elementsFromPoint` 手动遍历命中的组件

4. **简化测试场景**：
   - 创建一个最小复现案例
   - 排除其他组件/样式的干扰

## 10. 参考资料

- [dnd-kit 官方文档](https://docs.dndkit.com/)
- [dnd-kit Sortable 嵌套示例](https://docs.dndkit.com/presets/sortable/sortable-context)
- Webflow/Framer 拖拽交互设计

---

_文档创建时间：2025-11-28_
_最后更新：2025-12-01_
