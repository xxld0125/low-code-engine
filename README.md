# 低代码引擎 / Low-Code Engine

<div align="center">

**一个专为前端工程师设计的低代码平台，用于快速构建 PC 端后台管理系统**

_A low-code platform designed for frontend engineers to rapidly build PC-based admin systems_

[![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[功能特性](#功能特性-features) •
[快速开始](#快速开始-quick-start) •
[文档](#文档-documentation) •
[开发指南](#开发指南-development-guide)

</div>

---

## 📖 中文文档

### 简介

低代码引擎是一个功能完整的可视化页面搭建平台，旨在帮助前端工程师快速构建**后台管理系统**的 CRUD 页面。它在**开发效率**与**代码灵活性**之间取得了完美平衡。

### ✨ 功能特性

#### 🎨 可视化编辑器

- **三栏式布局**：组件库 | 画布 | 属性面板
- **拖拽搭建**：基于 dnd-kit 的智能拖拽系统
- **实时预览**：所见即所得的编辑体验
- **智能插入**：精确的组件放置算法（边缘检测、父级提升）

#### 🧩 组件系统

- **布局组件**：Container, Modal
- **基础组件**：Text, Button
- **数据组件**：
  - **Table**：支持数据绑定、列配置、前端分页
  - **Form**：自动生成表单、字段验证、提交处理

#### 🔗 数据绑定

- **模板表达式**：`{{user.name}}`、`{{row.status}}`
- **条件渲染**：`{{row.status === 'active' ? '已激活' : '未激活'}}`
- **上下文数据**：`user`, `row`, `pageParams`

#### ⚡ 交互系统

- **预设动作**：
  - 打开/关闭模态框
  - 提交表单（Supabase）
  - 刷新表格
  - 页面跳转
  - Toast 提示

#### 🎯 用户体验

- **未保存提醒**：防止意外刷新导致数据丢失
- **拖拽优化**：流畅的拖拽反馈，无 Layout Shift
- **表单验证**：基于 zod 的字段验证
- **错误处理**：友好的错误提示（Sonner Toast）

### 🛠 技术栈

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State**: Zustand
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Backend**: Supabase (Database, Auth, RLS)
- **Form**: react-hook-form, zod
- **UI**: Radix UI, Lucide Icons

### 🚀 快速开始

#### 前置要求

- Node.js 18+
- pnpm (推荐) 或 npm
- Supabase 账号

#### 1. 克隆项目

```bash
git clone https://github.com/your-username/low-code-engine.git
cd low-code-engine
```

#### 2. 安装依赖

```bash
pnpm install
# 或
npm install
```

#### 3. 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

获取 Supabase 配置：

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目或选择已有项目
3. 进入 Project Settings > API
4. 复制 `URL` 和 `anon key`

#### 4. 初始化数据库

在 Supabase SQL Editor 中执行：

```bash
cat docs/supabase_schema.sql
```

复制内容并在 Supabase Dashboard 的 SQL Editor 中执行。

#### 5. 启动开发服务器

```bash
pnpm dev
# 或
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 📁 项目结构

```
low-code-engine/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 认证页面（登录/注册）
│   ├── (main)/              # 主应用
│   │   ├── dashboard/       # 页面管理
│   │   └── editor/[pageId]/ # 可视化编辑器
│   └── page/[pageId]/       # 运行时页面
├── components/
│   ├── editor/              # 编辑器组件
│   │   ├── canvas.tsx       # 画布
│   │   ├── left-sidebar.tsx # 组件库
│   │   ├── right-panel.tsx  # 属性面板
│   │   └── drag-drop-context.tsx # 拖拽状态
│   ├── renderer/            # 可视化组件
│   │   ├── basic-components.tsx    # Text, Button
│   │   ├── layout-components.tsx   # Container, Modal
│   │   └── data-components.tsx     # Table, Form
│   ├── runtime/             # 运行时组件
│   └── ui/                  # shadcn/ui 基础组件
├── lib/
│   ├── services/            # 数据服务
│   │   ├── page-service.ts  # 页面 CRUD
│   │   ├── data-service.ts  # 业务数据
│   │   └── schema-service.ts # Schema 查询
│   ├── runtime/             # 运行时引擎
│   │   ├── expression-resolver.ts # 表达式解析
│   │   └── action-executor.ts     # 动作执行
│   └── supabase/            # Supabase 客户端
├── stores/
│   └── editor-store.ts      # Zustand 状态管理
├── docs/                    # 完整文档
│   ├── prd.md              # 产品需求文档
│   ├── tech_design.md      # 技术设计文档
│   ├── tasks.md            # 开发任务清单
│   └── tech/               # 详细技术文档
└── CHANGELOG.md            # 版本更新日志
```

### 📚 文档

- [📖 文档中心](./docs/) - 所有文档的导航入口
- [🚀 快速开始](./docs/user-guide/getting-started.md) - 5分钟快速上手
- [🏗️ 系统架构](./docs/development/architecture.md) - 技术架构设计
- [🔧 API 文档](./docs/development/api/api.md) - 接口文档
- [📖 用户手册](./docs/user-guide/user-manual.md) - 详细使用指南

#### 版本文档

- [v1.0.0 MVP](./docs/versions/v1.0.0-MVP/) - 已发布版本
- [v1.1.0 Data Engine](./docs/versions/v1.1.0/) - 已发布 (数据驱动核心)
- [v1.2.0 Planning](./docs/versions/v1.2.0/) - 规划中 (智能组件)

### 🎯 使用示例

#### 创建"用户管理"页面

1. **登录系统** → 进入 Dashboard
2. **创建新页面** → 输入页面名称
3. **搭建布局**：
   - 拖入 Container 和 Text（标题）
   - 拖入 Table 组件
   - 配置 Table：绑定 `users` 表，设置列
4. **添加新增功能**：
   - 拖入 Button（新建用户）
   - 配置动作：打开 Modal
   - 在 Modal 中拖入 Form 组件
   - 配置 Form：绑定 `users` 表，自动生成字段
5. **保存并预览** → 点击 Preview 查看效果

完成！一个完整的用户管理页面只需 **5 分钟**。

### 🔧 开发指南

#### 本地开发

```bash
# 启动开发服务器
pnpm dev

# 代码检查
pnpm lint

# 类型检查
pnpm type-check

# 格式化代码
pnpm format
```

#### 添加新组件

1. 在 `components/renderer/` 中创建组件
2. 在 `types/editor.ts` 中定义 Props 类型
3. 在 `components/editor/left-sidebar.tsx` 中注册组件
4. 在 `components/editor/property-panel/` 中添加配置表单

详见 [前端架构文档](./docs/development/frontend/architecture.md)

### 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

提交信息请遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 📝 License

本项目采用 MIT License - 详见 [LICENSE](LICENSE) 文件。

### 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Supabase](https://supabase.com/) - 开源 Firebase 替代方案
- [dnd-kit](https://dndkit.com/) - 拖拽库
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库

---

## 📖 English Documentation

### Introduction

Low-Code Engine is a fully-featured visual page builder designed to help frontend engineers rapidly build **CRUD pages** for admin systems. It strikes the perfect balance between **development efficiency** and **code flexibility**.

### ✨ Features

#### 🎨 Visual Editor

- **Three-Column Layout**: Component Library | Canvas | Property Panel
- **Drag & Drop**: Intelligent drag-and-drop system based on dnd-kit
- **Live Preview**: WYSIWYG editing experience
- **Smart Insertion**: Precise component placement algorithm (edge detection, parent elevation)

#### 🧩 Component System

- **Layout Components**: Container, Modal
- **Basic Components**: Text, Button
- **Data Components**:
  - **Table**: Data binding, column configuration, client-side pagination
  - **Form**: Auto-generation, field validation, submission handling

#### 🔗 Data Binding

- **Template Expressions**: `{{user.name}}`, `{{row.status}}`
- **Conditional Rendering**: `{{row.status === 'active' ? 'Active' : 'Inactive'}}`
- **Context Data**: `user`, `row`, `pageParams`

#### ⚡ Interaction System

- **Preset Actions**:
  - Open/Close Modal
  - Submit Form (to Supabase)
  - Refresh Table
  - Navigate
  - Show Toast

#### 🎯 User Experience

- **Unsaved Changes Warning**: Prevent data loss from accidental refresh
- **Drag Optimization**: Smooth drag feedback without Layout Shift
- **Form Validation**: Field validation based on zod
- **Error Handling**: User-friendly error messages (Sonner Toast)

### 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State**: Zustand
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Backend**: Supabase (Database, Auth, RLS)
- **Form**: react-hook-form, zod
- **UI**: Radix UI, Lucide Icons

### 🚀 Quick Start

#### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/low-code-engine.git
cd low-code-engine
```

#### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

#### 3. Configure Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get Supabase configuration:

1. Visit [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to Project Settings > API
4. Copy `URL` and `anon key`

#### 4. Initialize Database

Execute in Supabase SQL Editor:

```bash
cat docs/supabase_schema.sql
```

Copy the content and execute it in Supabase Dashboard's SQL Editor.

#### 5. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 📁 Project Structure

```
low-code-engine/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login/register)
│   ├── (main)/              # Main application
│   │   ├── dashboard/       # Page management
│   │   └── editor/[pageId]/ # Visual editor
│   └── page/[pageId]/       # Runtime pages
├── components/
│   ├── editor/              # Editor components
│   │   ├── canvas.tsx       # Canvas
│   │   ├── left-sidebar.tsx # Component library
│   │   ├── right-panel.tsx  # Property panel
│   │   └── drag-drop-context.tsx # Drag state
│   ├── renderer/            # Visual components
│   │   ├── basic-components.tsx    # Text, Button
│   │   ├── layout-components.tsx   # Container, Modal
│   │   └── data-components.tsx     # Table, Form
│   ├── runtime/             # Runtime components
│   └── ui/                  # shadcn/ui base components
├── lib/
│   ├── services/            # Data services
│   │   ├── page-service.ts  # Page CRUD
│   │   ├── data-service.ts  # Business data
│   │   └── schema-service.ts # Schema queries
│   ├── runtime/             # Runtime engine
│   │   ├── expression-resolver.ts # Expression parsing
│   │   └── action-executor.ts     # Action execution
│   └── supabase/            # Supabase clients
├── stores/
│   └── editor-store.ts      # Zustand state management
├── docs/                    # Complete documentation
│   ├── prd.md              # Product requirements
│   ├── tech_design.md      # Technical design
│   ├── tasks.md            # Development tasks
│   └── tech/               # Detailed technical docs
└── CHANGELOG.md            # Version changelog
```

### 📚 Documentation

- [📖 Documentation Center](./docs/) - Complete documentation portal
- [🚀 Quick Start](./docs/user-guide/getting-started.md) - Get started in 5 minutes
- [🏗️ System Architecture](./docs/development/architecture.md) - Technical architecture
- [🔧 API Documentation](./docs/development/api/api.md) - API reference
- [📖 User Manual](./docs/user-guide/user-manual.md) - Detailed user guide

#### Version Documentation

- [v1.0.0 MVP](./docs/versions/v1.0.0-MVP/) - Released version
- [v1.1.0 Data Engine](./docs/versions/v1.1.0/) - Released (Data Driven Core)
- [v1.2.0 Planning](./docs/versions/v1.2.0/) - Planning (Smart Components)

### 🎯 Usage Example

#### Create a "User Management" Page

1. **Login** → Go to Dashboard
2. **Create New Page** → Enter page name
3. **Build Layout**:
   - Drag Container and Text (title)
   - Drag Table component
   - Configure Table: bind to `users` table, set columns
4. **Add Create Feature**:
   - Drag Button (New User)
   - Configure action: Open Modal
   - Drag Form component in Modal
   - Configure Form: bind to `users` table, auto-generate fields
5. **Save and Preview** → Click Preview to view

Done! A complete user management page in just **5 minutes**.

### 🔧 Development Guide

#### Local Development

```bash
# Start dev server
pnpm dev

# Lint code
pnpm lint

# Type check
pnpm type-check

# Format code
pnpm format
```

#### Adding New Components

1. Create component in `components/renderer/`
2. Define Props type in `types/editor.ts`
3. Register component in `components/editor/left-sidebar.tsx`
4. Add configuration form in `components/editor/property-panel/`

See [Frontend Architecture](./docs/development/frontend/architecture.md) for details.

### 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Submit a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

### 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [dnd-kit](https://dndkit.com/) - Drag and drop library
- [shadcn/ui](https://ui.shadcn.com/) - UI component library

---

<div align="center">

**Made with ❤️ by Frontend Engineers, for Frontend Engineers**

[⬆ 回到顶部 / Back to Top](#低代码引擎--low-code-engine)

</div>
