# 低代码引擎文档中心

欢迎来到低代码引擎的文档中心！这里是项目的核心文档库，包含了从产品规划到技术实现的所有文档。

## 📚 文档导航

### 🚀 快速开始

- [项目 README](../README.md) - 项目介绍和快速上手

### 📋 版本管理

- [v1.0.0 MVP](versions/v1.0.0-MVP/) - 已发布的 MVP 版本文档
- [v1.1.0 开发中](versions/v1.1.0/) - 当前开发版本文档

### 🎨 产品设计

- [设计风格指南](design/style-guide.md) - UI/UX 设计规范
- [原型场景](design/mockup-scenarios.md) - 产品原型设计

### 💻 开发文档

#### 架构设计

- [系统架构](development/architecture.md) - 整体架构设计
- [数据库设计](development/database/schema.md) - 数据库结构设计
- [组件 DSL 设计](development/core/dsl-schema.md) - 核心数据模型

#### 前端开发

- [前端核心架构](development/frontend/architecture.md) - 路由与状态管理
- [拖拽系统](development/frontend/drag-drop-system.md) - 拖拽功能实现

#### API 文档

- [API 概览](development/api/api.md) - API 文档导航

### 🧪 测试文档

- [缺陷报告](testing/bug-reports/) - 历史问题追踪

## 🗂️ 文档结构说明

```
docs/
├── versions/          # 版本管理
├── product/           # 产品相关文档
├── design/            # 设计相关文档
├── development/       # 开发相关文档
│   ├── api/          # API 文档
│   ├── frontend/     # 前端开发
│   └── database/     # 数据库
├── testing/          # 测试文档
```

## 📝 文档贡献指南

### 文档编写规范

1. **Markdown 格式**: 所有文档使用 Markdown 格式编写
2. **命名规范**:
   - 文件名使用小写字母和连字符，如 `getting-started.md`
   - 避免使用空格和特殊字符
3. **目录结构**: 按照文档类型和受众合理分类
4. **版本控制**: 重要变更需要在文档中注明版本信息

### 文档更新流程

1. 创建或修改文档
2. 更新本文档的导航链接（如有必要）
3. 提交代码变更
4. 在 PR 中说明文档变更内容

## 📬 反馈与建议

如果您在使用文档过程中遇到问题或有改进建议，请：

1. 提交 Issue 反馈问题
2. 提交 PR 贡献文档
3. 联系文档维护者

---

**最后更新**: 2025-12-11
**维护者**: 低代码引擎团队
