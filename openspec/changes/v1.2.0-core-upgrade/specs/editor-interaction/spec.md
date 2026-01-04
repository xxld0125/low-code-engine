# Specification: Editor Interaction

## ADDED Requirements

### Requirement: [Editor.History] Undo/Redo support for schema changes

编辑器**必须 (MUST)** 维护所有 Schema 变更的历史栈，以允许用户撤销意外的修改。

#### Scenario: 撤销组件删除操作

Given 我已经删除了一个 Button 组件
And 历史记录栈已记录此操作
When 我按下 'Cmd+Z' 快捷键
Then Button 组件应该重新出现在画布上
And 选中状态应该恢复到该 Button 上

#### Scenario: 重做属性变更

Given 我撤销了一个属性变更（例如颜色修改）
When 我按下 'Cmd+Shift+Z' 快捷键
Then 颜色应该恢复到修改后的新值

### Requirement: [Editor.Auxiliary] Smart snapping during drag

拖拽交互**应当 (SHALL)** 提供视觉辅助线和磁性吸附功能以辅助对齐。

#### Scenario: 吸附到附近组件

Given 我正在拖拽一个 Button 组件
When Button 的边缘距离另一个组件的边缘在 5px 以内
Then Button 应该自动吸附对齐到该组件
And 应该显示一条蓝色的对齐辅助线

### Requirement: [Editor.Viewport] Multi-viewport preview

编辑器画布**必须 (MUST)** 支持在不同的设备视口尺寸之间切换，以预览响应式效果。

#### Scenario: 切换到移动端视图

Given 我当前处于桌面端视图（默认）
When 我点击工具栏上的“手机”图标
Then 画布宽度应该调整为 375px
And 页面内容应该重新流排以适应新宽度
