# v1.2.0 技术设计方案 (Technical Design)

## 1. 概述

本版本旨在增强编辑器的交互深度与逻辑能力。核心技术难点在于 **历史记录管理 (Undo/Redo)**、**辅助交互计算** 以及 **运行时组件联动**。

## 2. 撤销/重做 (Undo/Redo)

### 2.1 状态管理架构

由于 Zustand 是当前的状态管理库，我们采用 **Middleware + Patches** 的方案，避免全量快照带来的内存开销。

- **库选型**: `zundo` (基于 Zustand 的中间件) 或 `immer` 的 `produceWithPatches`。
- **策略**: 仅对 `editorStore` 中的 `page.schema` 字段进行历史记录追踪，忽略 `selectedId`, `dragState` 等临时 UI 状态。

### 2.2 数据结构

```typescript
interface HistoryState {
  past: Patch[][] // 撤销栈 (存储 inverse patches)
  future: Patch[][] // 重做栈 (存储 forward patches)
  present: Schema // 当前状态
}

// Patch 结构 (基于 RFC 6902)
interface Patch {
  op: 'replace' | 'add' | 'remove'
  path: (string | number)[]
  value?: any
}
```

### 2.3 交互逻辑

1.  **Debounce**: 拖拽过程中（`onDragMove`）不记录历史，仅在 `onDragEnd` 时记录一次。
2.  **Input**: 属性面板输入框采用 `onBlur` 或 `debounce(500ms)` 记录，避免逐字输入产生过多历史。

## 3. 辅助交互 (Auxiliary Interaction)

### 3.1 辅助引导线 (Ref Lines)

在拖拽层（DndContext）中实现计算逻辑：

1.  **坐标收集**: `onDragStart` 时，收集画布上所有非拖拽组件的边缘坐标（Top, Bottom, Left, Right, CenterX, CenterY）。
2.  **实时比对**: `onDragMove` 时，将拖拽组件的 6 个关键坐标与收集的坐标集进行差值计算。
3.  **阈值吸附**: 当 `|delta| < 5px` 时，触发吸附（修改 transform），并渲染辅助线。

### 3.2 智能吸附 (Snapping)

```typescript
// 伪代码算法
function calcSnapping(activeRect, otherRects) {
  const threshold = 5
  let snapX = null
  let snapY = null

  for (const target of otherRects) {
    // 检查左对齐
    if (abs(activeRect.left - target.left) < threshold) {
      snapX = target.left
      drawGuideLine(target.left)
    }
    // ... 检查其他5个方位
  }

  return { x: snapX ?? originalX, y: snapY ?? originalY }
}
```

## 4. 组件联动 (Component Linkage)

### 4.1 表达式引擎

为了安全且轻量地执行 `{{ formData.type === 'A' }}`，我们不引入重量级的 eval 库，而是构建一个受限的执行上下文。

- **实现**: 使用 `new Function` + `Proxy` (沙箱)。
- **依赖收集**: 解析表达式中的变量路径（如 `formData.type`），建立 `Deps -> ComponentId[]` 的映射表。当 `formData` 变更时，仅重渲染相关组件。

### 4.2 事件总线 (Event Bus)

扩展 `RuntimeStore`，增加事件中心：

```typescript
interface EventBus {
  listeners: Record<string, Action[]>;
  emit(event: string, payload: any): void;
  on(event: string, action: Action): void;
}

// Schema 定义
interface ComponentSchema {
  events: {
    onClick?: {
      type: 'emit';
      eventName: 'refreshTable';
      payload: { ... };
    }[];
    onCustomEvent?: {
      eventName: 'refreshTable';
      actions: Action[]; // e.g., reload()
    }[];
  }
}
```

## 5. 出码模块 (Code Generation)

### 5.1 纯文本生成

不依赖 Babel/AST 进行生成（太重），采用**基于模板字符串**的生成策略。

1.  **Component Map**: 定义每个组件的 React 代码模板。
2.  **Generator**: 递归遍历 Schema Tree，拼接 Import 语句与 JSX 结构。
3.  **Formatter**: 使用 `prettier/standalone` 格式化输出代码。

## 6. 开发任务拆解

1.  **Phase 1 (Core)**: 引入 `zundo` 实现 Undo/Redo；实现基础的辅助线计算 hook。
2.  **Phase 2 (Logic)**: 实现表达式解析器 `ExpressionResolver` 和依赖收集机制。
3.  **Phase 3 (UI)**: 更新属性面板，支持“显隐表达式”输入和“事件”配置 tab。
