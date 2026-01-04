# Change Proposal: v1.2.0-core-upgrade

## Summary

升级低代码平台核心能力（"平台核心底座升级"），从 MVP 转型为生产力工具。本版本主要聚焦于提升编辑器交互深度、逻辑编排灵活性以及工程化健壮性。

## Goals

- **编辑器交互**: 解决“误操作无法挽回”（撤销/重做）和“布局对齐困难”（辅助交互）的问题。
- **逻辑能力**: 突破“静态页面+简单数据绑定”的限制，引入动态逻辑能力（组件联动、脚本沙箱）。
- **工程化**: 增强健壮性和可维护性（Schema 版本管理）。

## Requirements

### P0: 编排与交互 (Layout & Interaction)

- **撤销/重做 (Undo/Redo)**:
  - 维护用户操作的历史记录栈。
  - 支持对组件增删改、属性变更、样式调整的撤销 (`Cmd+Z`) 和重做 (`Cmd+Shift+Z`)。
- **辅助交互 (Auxiliary Interaction)**:
  - 智能吸附: 拖拽时自动吸附到附近组件边缘或中心轴。
  - 辅助线: 显示动态对齐辅助线及距离像素值。
  - 父级高亮: 拖拽入嵌套容器时，清晰高亮当前的放置目标。
- **多视图模式 (Multi-Viewport)**:
  - 响应式预览: 切换 Desktop (100%), Tablet (768px), Mobile (375px) 视图。
  - 画布缩放: 支持画布内容的放大/缩小。

### P1: 动态性与逻辑 (Dynamics & Logic)

- **组件联动 (Component Linkage)**:
  - 表达式显隐: 通过 JS 表达式控制组件 `visible` 属性 (例如 `{{ formData.paymentType === 'credit_card' }}`)。
  - 事件总线: 全局事件总线用于组件通信 (emit/on)。
- **脚本与沙箱 (Scripting & Sandbox)**:
  - 转换函数: 数据绑定中的简单转换逻辑 (例如 `{{ row.status === 1 ? 'Active' : 'Inactive' }}`)。
  - 安全执行: 基础沙箱机制 (Proxy/`new Function`) 防止全局污染。

### P2: 协议与工程化 (Protocol & Engineering)

- **Schema 版本管理 (Schema Versioning)**:
  - 发布历史: 每次保存/发布生成新的 Schema 版本。
  - 版本回滚: 在 Dashboard 查看历史并支持一键回滚。
- **源码预览 (Source Code Preview)**:
  - 查看代码: 编辑器内提供“查看代码”按钮。
  - React 代码生成: 实时生成可读性高的 React 组件代码 (Next.js + shadcn/ui 风格)。

## Non-Goals (v1.3.0)

- 智能表单/表格
- 原子组件扩充
