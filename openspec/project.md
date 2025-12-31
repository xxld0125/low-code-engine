# Project Context

## Purpose

低代码引擎是一个专为前端工程师设计的可视化页面搭建平台，用于快速构建 PC 端后台管理系统的 CRUD 页面。项目在**开发效率**与**代码灵活性**之间取得平衡，帮助开发者通过拖拽方式快速创建数据驱动的管理界面。

**核心价值**：

- 可视化编辑器：三栏式布局（组件库 | 画布 | 属性面板）
- 数据驱动：支持数据对象管理和动态表单/表格生成
- 运行时渲染：基于 Schema 的运行时渲染引擎
- 快速迭代：5 分钟构建完整的用户管理页面

## Tech Stack

### 前端核心

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript 5.x (strict mode)
- **UI 库**: React 19.0.0
- **样式**: Tailwind CSS 3.x + shadcn/ui
- **状态管理**: Zustand 5.x
- **拖拽引擎**: @dnd-kit/core 6.x + @dnd-kit/sortable 10.x

### 表单与验证

- **表单管理**: react-hook-form 7.x
- **验证库**: Zod 4.x
- **解析器**: @hookform/resolvers 5.x

### UI 组件

- **基础组件**: Radix UI (Alert Dialog, Checkbox, Dialog, Dropdown, Select, Label, Slot)
- **图标**: Lucide React
- **通知**: Sonner (Toast)
- **工具类**: clsx, tailwind-merge, class-variance-authority

### 后端服务

- **BaaS**: Supabase (PostgreSQL + Authentication + RLS)
- **客户端**: @supabase/ssr (latest), @supabase/supabase-js (latest)
- **数据查询**: @tanstack/react-query 5.x

### 工具库

- **工具函数**: lodash 4.x
- **日期处理**: date-fns 4.x

### 开发工具

- **包管理**: pnpm >= 9
- **代码检查**: ESLint 9.x + Next.js config
- **代码格式化**: Prettier 3.x + prettier-plugin-tailwindcss
- **Git Hooks**: Husky 9.x + lint-staged
- **提交规范**: @commitlint/cli + @commitlint/config-conventional
- **版本管理**: standard-version

### 环境要求

- **Node.js**: >= 22.19.0
- **pnpm**: >= 9

## Project Conventions

### Code Style

#### TypeScript

- 启用 `strict` 模式
- 使用类型推断，避免不必要的类型注解
- 优先使用 `interface` 而非 `type`（除非需要联合类型或工具类型）
- 组件 Props 使用 `interface` 定义，命名格式：`ComponentNameProps`

#### 命名规范

- **文件命名**: kebab-case（如 `editor-store.ts`, `left-sidebar.tsx`）
- **组件命名**: PascalCase（如 `EditorLayout`, `PropertyPanel`）
- **变量/函数**: camelCase（如 `editorStore`, `handleDragEnd`）
- **常量**: UPPER_SNAKE_CASE（如 `MAX_HISTORY_SIZE`）
- **类型/接口**: PascalCase（如 `EditorState`, `ComponentProps`）

#### 代码组织

- **组件结构**:
  ```
  components/
  ├── editor/          # 编辑器相关组件
  ├── renderer/        # 可视化渲染组件
  ├── runtime/         # 运行时组件
  └── ui/              # 基础 UI 组件（shadcn/ui）
  ```
- **服务层**: `lib/services/` - 数据服务抽象
- **运行时引擎**: `lib/runtime/` - 表达式解析、动作执行
- **状态管理**: `stores/` - Zustand stores

#### 格式化规则

- 使用 Prettier 自动格式化
- Tailwind CSS 类名自动排序（prettier-plugin-tailwindcss）
- 提交前自动运行 lint-staged（ESLint + Prettier）

### Architecture Patterns

#### 应用架构

- **路由**: Next.js App Router
  - `app/(auth)/` - 认证页面（登录/注册）
  - `app/(main)/dashboard/` - 页面管理
  - `app/(main)/editor/[pageId]/` - 可视化编辑器
  - `app/page/[pageId]/` - 运行时页面渲染
  - `app/data-center/` - 数据对象管理中心

#### 状态管理

- **全局状态**: Zustand stores
  - `editor-store.ts` - 编辑器状态（组件树、选中状态、拖拽状态）
  - `runtime-store.ts` - 运行时状态（数据、事件）
  - `useModelStore.ts` - 数据对象状态
- **服务端状态**: React Query (@tanstack/react-query)
- **表单状态**: React Hook Form（本地组件状态）

#### 组件设计模式

- **容器组件**: 负责数据获取和状态管理
- **展示组件**: 纯 UI 组件，通过 Props 接收数据
- **渲染器模式**:
  - `components/renderer/` - 编辑器中的可视化组件
  - `components/runtime/` - 运行时渲染组件
  - 两者共享相同的 Props 接口，但实现不同

#### 数据流

```
用户操作 → Editor Store → Schema 更新 → 保存到 Supabase
                                    ↓
运行时页面 → 读取 Schema → Runtime Renderer → UI 渲染
```

#### 服务层抽象

- `lib/services/page-service.ts` - 页面 CRUD
- `lib/services/data-service.ts` - 业务数据操作
- `lib/services/schema-service.ts` - Schema 查询

#### 运行时引擎

- `lib/runtime/expression-resolver.ts` - 模板表达式解析（`{{user.name}}`）
- `lib/runtime/action-executor.ts` - 动作执行（打开模态框、提交表单等）

### Testing Strategy

**当前状态**: 测试框架尚未配置，测试策略待完善。

**规划方向**:

- 单元测试：组件逻辑和工具函数
- 集成测试：编辑器操作流程
- E2E 测试：完整页面创建流程

### Git Workflow

#### 分支策略

- `main` - 主分支，稳定版本
- `develop` - 开发分支
- `feature/*` - 功能分支
- `fix/*` - Bug 修复分支

#### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

**格式**: `类型: 描述`（描述在 20 字以内）

**类型**:

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档
- `style`: 样式（不影响代码逻辑）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 其他（构建、工具等）

**示例**:

```
feat: 添加撤销重做功能
fix: 修复拖拽时组件丢失问题
docs: 更新架构设计文档
refactor: 重构表达式解析器
```

**工具**:

- Commitlint 自动检查提交信息格式
- Husky Git hooks 确保提交前代码质量

## Domain Context

### 核心概念

#### Schema（页面结构）

- JSON 格式的页面结构定义
- 包含组件树、属性配置、样式、事件绑定
- 存储在 Supabase `pages` 表的 `schema` 字段

#### 数据对象（Data Object）

- 用户定义的数据模型（类似数据库表结构）
- 包含字段定义、验证规则、关系配置
- 存储在 `data_objects` 表，并动态创建对应的业务表

#### 组件系统

- **布局组件**: Container, Modal
- **基础组件**: Text, Button
- **数据组件**: Table（数据绑定、列配置）, Form（自动生成、字段验证）

#### 数据绑定

- **模板表达式**: `{{user.name}}`, `{{row.status}}`
- **条件渲染**: `{{row.status === 'active' ? '已激活' : '未激活'}}`
- **上下文数据**: `user`（当前用户）, `row`（表格行数据）, `pageParams`（页面参数）

#### 动作系统

- **预设动作**: 打开/关闭模态框、提交表单、刷新表格、页面跳转、Toast 提示
- **事件绑定**: 组件事件（如 Button 的 onClick）可绑定动作

### 编辑器工作流

1. **创建页面** → Dashboard 中创建新页面
2. **拖拽搭建** → 在编辑器中拖拽组件到画布
3. **配置属性** → 在右侧属性面板配置组件属性
4. **数据绑定** → 配置数据源和表达式
5. **保存预览** → 保存 Schema 并预览运行时效果

### 运行时工作流

1. **加载 Schema** → 从数据库读取页面 Schema
2. **解析表达式** → 解析模板表达式和数据绑定
3. **渲染组件** → 根据 Schema 递归渲染组件树
4. **执行动作** → 响应用户交互，执行配置的动作

## Important Constraints

### 技术约束

- **Node.js 版本**: 必须 >= 22.19.0
- **包管理器**: 必须使用 pnpm >= 9（不支持 npm/yarn）
- **数据库**: 必须使用 Supabase PostgreSQL（不支持其他数据库）
- **浏览器支持**: 现代浏览器（Chrome, Firefox, Safari, Edge 最新版本）

### 业务约束

- **目标用户**: 前端工程师（非业务人员）
- **使用场景**: PC 端后台管理系统（不支持移动端编辑器）
- **数据安全**: 所有数据操作必须通过 Supabase RLS（行级安全）策略

### 性能约束

- **Schema 大小**: 单个页面 Schema 建议 < 100KB
- **组件数量**: 单个页面建议 < 500 个组件
- **数据量**: 表格组件建议单页 < 1000 条数据（前端分页）

### 安全约束

- **用户脚本执行**: v1.2.0 使用基础沙箱（`new Function` + Proxy），v1.3.0 计划使用 iframe 强隔离
- **SQL 注入防护**: 所有数据库操作使用参数化查询
- **XSS 防护**: 模板表达式输出自动转义

## External Dependencies

### Supabase

- **用途**:
  - PostgreSQL 数据库（存储页面 Schema、数据对象、业务数据）
  - 用户认证（Email/Password）
  - 行级安全策略（RLS）
- **配置**:
  - `NEXT_PUBLIC_SUPABASE_URL` - 项目 URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 匿名密钥
- **关键表**:
  - `pages` - 页面元数据和 Schema
  - `data_objects` - 数据对象定义
  - `operation_records` - 操作历史记录（v1.2.0）
  - 动态业务表（由数据对象创建）

### 第三方服务

- **无其他外部 API 依赖**（所有功能基于 Supabase）

### 开发依赖

- **GitHub**: 代码托管和版本控制
- **npm registry**: 包依赖管理
