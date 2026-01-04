# Design: v1.2.0-core-upgrade

## Overview

本设计方案旨在解决 v1.2.0 的核心技术挑战：历史记录管理 (Undo/Redo)、辅助交互计算以及运行时组件联动。

## Architecture

### 撤销/重做 (Undo/Redo State Management)

- **策略**: Middleware + Patches。使用 `zundo` 或 `immer` patches 仅追踪 `editorStore.page.schema` 的变更，忽略临时 UI 状态。
- **数据结构**:
  ```typescript
  interface HistoryState {
    past: Patch[][]
    future: Patch[][]
    present: Schema
  }
  ```
- **交互逻辑**:
  - **防抖 (Debounce)**: 仅在 `onDragEnd` 时记录历史，`onDragMove` 过程中不记录。
  - **输入优化**: 属性面板输入框采用 `onBlur` 或防抖机制记录，避免逐字输入产生过多历史。

### 辅助交互 (Auxiliary Interaction)

- **辅助线 (Ref Lines)**:
  - **坐标收集**: `onDragStart` 时，收集所有静态组件的边缘坐标。
  - **实时比对**: `onDragMove` 时，计算拖拽组件与收集坐标的差值。
  - **阈值吸附**: 当 `|delta| < 5px` 时，自动吸附并渲染辅助线。
- **算法**: 检查左/右/上/下/中心五个方位的对齐情况。

### 组件联动 (Component Linkage)

- **表达式引擎**:
  - **实现**: `new Function` + `Proxy` 沙箱。
  - **依赖收集**: 解析表达式中的变量路径 (如 `formData.type`) 建立 `Deps -> ComponentId[]` 映射。当数据变更时，仅重渲染相关组件。
- **事件总线 (Event Bus)**:
  - 扩展 `RuntimeStore`，增加事件中心 (`emit`, `on`)。
  - 事件 Schema 定义 (`onClick` 触发 `emit`)。

### 代码生成 (Code Generation)

- **策略**: 基于模板字符串生成 (比 AST 更轻量)。
- **流程**: Component Map 模板 -> 递归生成器 -> Prettier 格式化。

### Tasks Phasing

1. **Core**: 实现 Undo/Redo 基础逻辑，基础辅助线计算 hook。
2. **Logic**: 实现表达式解析器和依赖收集机制。
3. **UI**: 更新属性面板，支持“显隐表达式”输入和“事件”配置 tab。
