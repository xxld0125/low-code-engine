# 开发任务清单 (Development Tasks)

本文档基于 PRD、技术设计文档及设计规范生成，旨在指导项目的分步开发与落地。

## Phase 1: 项目初始化与基础设施 (Initialization & Infrastructure)

本阶段目标：搭建项目骨架，配置基础样式与数据库，确保开发环境就绪。

- [x] **1.1 [FE] 项目初始化**
  - [x] 使用 `create-next-app` 初始化 Next.js 15 项目 (TypeScript, Tailwind CSS, App Router)。
  - [x] 配置 `tsconfig.json` 路径别名 (`@/*`)。
  - [x] 安装核心依赖：`zustand`, `dnd-kit`, `@supabase/supabase-js`, `lucide-react`, `clsx`, `tailwind-merge`。
  - [x] 初始化 `shadcn/ui` 并配置 `components.json`。

- [x] **1.2 [FE] 样式系统配置 (Admin Style Adaptation)**
  - [x] 参考 `docs/DesignStyleGuide.md` 和 `docs/design/admin_style_adaptation.md` 配置 `tailwind.config.ts`。
    - [x] 扩展颜色系统：`primary` (#383838), `background` (#F4EFEA), `accent` (#16AA98)。
    - [x] 扩展字体大小：添加 `13px` 支持。
    - [x] 配置默认圆角为 `0px` (Sharp corners)。
  - [x] 创建基础 UI 组件 (覆盖 shadcn 默认样式)：
    - [x] `Button`: 移除圆角，应用 Admin 颜色变体。
    - [x] `Input`: 设置高度 36px，边框 1.5px，移除圆角。
    - [x] `Table`: 实现 Admin 风格表格 (Header #F4EFEA, 紧凑 Padding)。

- [x] **1.3 [FE] Supabase 集成**
  - [x] 配置环境变量 `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)。
  - [x] 创建 Supabase Client 实例 (`lib/supabase/client.ts`, `server.ts`)。
  - [x] 生成 Supabase TypeScript 类型定义 (`types/supabase.ts`)。

- [ ] **1.4 [BE] 数据库与安全策略**
  - [ ] 在 Supabase 执行 SQL 创建 `pages` 表 (参考 `docs/tech/database.md`)。
  - [ ] 配置 `pages` 表的 RLS 策略 (增删改查仅限 Owner)。
  - [ ] 验证数据库连接与 RLS 生效。

- [x] **1.5 [FE] 认证页面 (Authentication)**
  - [x] 创建 `app/(auth)/login/page.tsx` 和 `app/(auth)/register/page.tsx`。
  - [x] 实现基于 Supabase Auth 的登录/注册表单。
  - [x] 实现受保护路由 (`(main)` 组)，未登录重定向至登录页。

## Phase 2: 核心服务与平台入口 (Core Services & Platform Entry)

本阶段目标：实现后端数据交互、全局状态管理以及平台的基础入口页面。

- [ ] **2.1 [FE] Service 层实现**
  - [ ] 实现 `PageService` (`lib/services/page-service.ts`)：
    - [ ] `getPages`, `getPage`, `createPage`, `updatePageSchema`, `deletePage`。
  - [ ] 实现 `SchemaService` (`lib/services/schema-service.ts`)：
    - [ ] `getTables`: 获取 public schema 下的表名。
    - [ ] `getTableColumns`: 获取指定表的字段定义。
  - [ ] 实现 `DataService` (`lib/services/data-service.ts`)：
    - [ ] `fetchTableData`, `insertRecord`, `updateRecord`, `deleteRecord`。

- [ ] **2.2 [FE] EditorStore 实现 (Zustand)**
  - [ ] 定义 `ComponentNode` 和 `EditorState` 类型 (参考 `docs/tech/schema.md` & `frontend.md`)。
  - [ ] 创建 `stores/editor-store.ts`。
  - [ ] 实现核心 Actions：
    - [ ] `addComponent`: 节点插入逻辑。
    - [ ] `removeComponent`: 递归删除逻辑。
    - [ ] `updateComponentProps` / `updateComponentStyle`。
    - [ ] `selectComponent`: 选中状态切换。
    - [ ] `moveComponent`: 节点移动与重排序逻辑 (原子操作，含循环引用检测)。
    - [ ] `copyComponent` / `pasteComponent`: 复制粘贴逻辑。
    - [ ] `undo` / `redo`: 历史记录管理 (History Stack)。

- [ ] **2.3 [FE] 平台入口与布局 (Platform Entry)**
  - [ ] 创建 `app/(main)/layout.tsx`：实现统一的 Header (包含 UserMenu, Logout)。
  - [ ] 创建 `app/dashboard/page.tsx`：
    - [ ] 展示用户页面列表 (调用 `PageService.getPages`)。
    - [ ] 实现新建页面功能 (调用 `PageService.createPage`)。
    - [ ] 实现删除页面功能。
    - [ ] 提供跳转至 Editor 和 Runtime 的入口。

## Phase 3: 编辑器 UI 框架 (Editor UI Foundation)

本阶段目标：构建编辑器的基本布局与拖拽交互框架。

- [ ] **3.1 [FE] 编辑器布局搭建**
  - [ ] 创建 `/editor/[pageId]/page.tsx` 页面结构。
  - [ ] 实现 `EditorLayout` 或 `ErrorBoundary`：捕获编辑器内部错误。
  - [ ] 实现三栏布局组件：
    - [ ] `LeftSidebar`: 组件物料堆与组件树视图 (Component Tree)。
    - [ ] `Canvas`: 中心画布区域。
    - [ ] `RightPanel`: 属性配置区域。
  - [ ] 实现 `Header`: 包含页面名称、保存按钮 (调用 PageService)、预览按钮。

- [ ] **3.2 [FE] 拖拽系统集成 (dnd-kit)**
  - [ ] 配置 `DndContext` (Sensors, CollisionDetection)。
  - [ ] 实现 `SidebarItem` (Draggable)：允许从侧边栏拖出组件。
  - [ ] 实现 `CanvasDroppable`：允许组件放置到画布。
  - [ ] 实现画布内排序逻辑 (Sortable)。

- [ ] **3.3 [FE] 画布渲染器**
  - [ ] 实现 `ComponentRenderer`：递归渲染组件树。
  - [ ] 实现选中态高亮效果 (Overlay 或 Border)。
  - [ ] 处理点击事件：阻止冒泡并触发 `selectComponent`。

## Phase 4: 组件系统 MVP (Component System)

本阶段目标：实现所有 MVP 核心组件，并确保其符合 Schema 定义。

- [ ] **4.1 [FE] 基础布局组件**
  - [ ] `Container`: 基础 `div` 封装，支持 Padding/Margin/BgColor。
  - [ ] `Flex`: Flexbox 布局容器，支持 `justify`, `align`, `gap`。
  - [ ] `Grid`: Grid 布局容器，支持 `columns`, `gap`。
  - [ ] `Modal`: 模态框容器 (需扩展 Schema 或使用特殊 Container)。

- [ ] **4.2 [FE] 基础 UI 组件**
  - [ ] `Text`: 支持 HTML 标签选择 (h1-h3, p, span) 和文本内容绑定。
  - [ ] `Button`: 支持 variant, size, disabled 属性。

- [ ] **4.3 [FE] 数据驱动组件**
  - [ ] `Table`:
    - [ ] 接收 `tableName`, `columns` 等 Props。
    - [ ] 编辑态：显示模拟数据或空状态。
    - [ ] 运行态：调用 `DataService` 加载真实数据。
  - [ ] `Form`:
    - [ ] 接收 `tableName`, `fields` 等 Props。
    - [ ] 实现表单布局渲染 (Grid/Flex)。
    - [ ] 集成 `react-hook-form` 和 `zod` 验证。

## Phase 5: 属性面板与配置 (Property Panel)

本阶段目标：允许用户通过 GUI 配置组件属性、样式和交互。

- [ ] **5.1 [FE] 动态属性表单**
  - [ ] 根据当前选中组件的 `type` 渲染不同配置表单。
  - [ ] 实现 `TextPropsForm`, `ButtonPropsForm`。
  - [ ] 实现 `TablePropsForm`: 列配置 (添加/删除/排序列)。
  - [ ] 实现 `FormPropsForm`: 字段配置 (自动生成字段功能)。

- [ ] **5.2 [FE] 样式编辑器 (Style Editor)**
  - [ ] 实现通用样式表单：
    - [ ] Layout: Width, Height, Display.
    - [ ] Spacing: Margin, Padding.
    - [ ] Flex/Grid: Justify, Align, Gap.

- [ ] **5.3 [FE] 交互编辑器 (Action Editor)**
  - [ ] 实现动作配置列表。
  - [ ] 支持添加 `onClick` / `onSubmit` 事件。
  - [ ] 支持配置 Action Payload (如跳转 URL, 目标 Modal ID)。

## Phase 6: 运行时与数据绑定 (Runtime & Data Binding)

本阶段目标：实现最终页面的解析、渲染与交互逻辑。

- [ ] **6.1 [FE] 运行时页面**
  - [ ] 创建 `/page/[pageId]/page.tsx`。
  - [ ] 实现 `RuntimePage` 组件：获取 Schema 并初始化渲染。
  - [ ] 实现 `ErrorBoundary`：防止运行时错误导致白屏。

- [ ] **6.2 [FE] 数据绑定引擎**
  - [ ] 实现表达式解析工具函数 (`resolveExpression`)。
  - [ ] 支持 `{{user.name}}`, `{{row.field}}` 等模板语法。
  - [ ] 在 `PageRenderer` 中注入 Context 数据。

- [ ] **6.3 [FE] 交互执行器 (ActionExecutor)**
  - [ ] 实现 `handleAction(action, context)` 函数。
  - [ ] 对接 `DataService` 实现表单提交、表格刷新。
  - [ ] 实现 UI 交互：弹窗控制、Toast 提示、路由跳转。

## Phase 7: 集成与测试 (Integration & Polish)

- [ ] **7.1 [FE] 端到端流程验证**
  - [ ] 验证场景：创建一个“用户管理”页面。
  - [ ] 步骤：
    1. 拖入 Container 和 Text (标题)。
    2. 拖入 Table (绑定 users 表)。
    3. 拖入 Button (新建用户)，配置点击打开 Modal。
    4. 在 Modal 中拖入 Form (绑定 users 表)，配置提交动作。
    5. 保存并预览。
    6. 测试新增数据，验证表格刷新。

- [ ] **7.2 [FE] 性能与优化**
  - [ ] 优化拖拽流畅度。
  - [ ] 检查组件渲染性能 (避免不必要的重渲染)。
  - [ ] 完善错误处理与提示。
