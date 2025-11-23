# 高保真设计场景说明 (Mockup Scenarios)

本文档记录了 `docs/design` 目录下各个 HTML 高保真文件的使用场景和展示重点。

## 1. 仪表盘 (Dashboard)

- **文件**: [`dashboard_mockup.html`](./dashboard_mockup.html)
- **场景**: 用户登录后的首页。
- **功能展示**:
  - 页面列表展示 (Grid 视图)。
  - 新建页面入口。
  - 页面操作菜单 (编辑、预览、删除)。

## 2. 编辑器 - 基础/属性视图 (Editor - Props View)

- **文件**: [`editor_mockup.html`](./editor_mockup.html)
- **场景**: 编辑器的默认视图，选中组件时的属性配置状态。
- **功能展示**:
  - **左侧栏**: 组件库 (COMPONENTS) 激活状态。
  - **中间画布**: 选中组件的高亮、拖拽手柄、快捷操作栏 (删除/复制)。
  - **右侧栏**: 属性面板 (**PROPS**) 激活状态，展示组件的特定属性 (如 Input 的 Label, Placeholder)。

## 3. 编辑器 - 组件树视图 (Editor - Tree View)

- **文件**: [`editor_tree_view_mockup.html`](./editor_tree_view_mockup.html)
- **场景**: 用户在左侧查看页面结构树。
- **功能展示**:
  - **左侧栏**: 组件树 (**TREE**) 激活状态，展示页面的 DOM 树结构。
  - **其他**: 画布和右侧栏保持默认状态。

## 4. 编辑器 - 样式配置视图 (Editor - Style View)

- **文件**: [`editor_style_mockup.html`](./editor_style_mockup.html)
- **场景**: 用户配置组件的样式（布局、间距等）。
- **功能展示**:
  - **右侧栏**: 样式面板 (**STYLE**) 激活状态。
  - **内容**: 包含尺寸 (Width/Height)、间距可视化编辑器 (Margin/Padding)、布局模式 (Display) 等通用样式配置。

## 5. 编辑器 - 交互配置视图 (Editor - Interaction View)

- **文件**: [`editor_interaction_mockup.html`](./editor_interaction_mockup.html)
- **场景**: 用户为组件绑定交互事件。
- **功能展示**:
  - **右侧栏**: 事件面板 (**EVENTS**) 激活状态。
  - **内容**: 已绑定的事件列表 (如 On Click -> Submit Form)，以及新建交互的表单。

## 6. 编辑器 - 数据绑定视图 (Editor - Data Binding View)

- **文件**: [`editor_data_binding_mockup.html`](./editor_data_binding_mockup.html)
- **场景**: 用户为表格或表单组件配置数据源和字段。
- **功能展示**:
  - **右侧栏**: 属性面板 (**PROPS**) 激活状态。
  - **内容**:
    - **Data Source**: 选择 Supabase 数据表，配置分页。
    - **Columns Manager**: 列/字段的排序、显隐切换、重命名及详细属性配置。

## 7. 运行时预览 (Runtime Preview)

- **文件**: [`runtime_mockup.html`](./runtime_mockup.html)
- **场景**: 最终用户访问发布的页面。
- **功能展示**:
  - **独立布局**: 无编辑器外壳，全屏展示内容。
  - **内容**: 渲染后的组件（如用户管理表格），包含真实的交互样式（按钮、分页等）。

---

_注：所有 Mockup 均基于 1280px+ 桌面端设计。_
