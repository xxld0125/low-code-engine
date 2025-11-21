# 技术方案文档汇总

本文档作为低代码引擎技术方案的入口索引。详细的设计文档已拆分为以下模块：

## 1. [系统架构设计](./tech/architecture.md)

- 高层架构图 (Mermaid)
- 技术栈选型
- 核心模块划分
- 数据流向图

## 2. [数据库设计](./tech/database.md)

- 数据库 ER 图
- `pages` 表结构定义 (SQL)
- RLS 安全策略 (SQL)

## 3. [API 接口设计](./tech/api.md)

- Service 层接口定义
- `PageService` (页面管理)
- `SchemaService` (元数据)
- `DataService` (业务数据)

## 4. [前端设计](./tech/frontend.md)

- Next.js App Router 路由结构
- Zustand Store 状态管理设计
- 拖拽实现逻辑 (dnd-kit)
- 组件树渲染策略

## 5. [组件 Schema 设计](./tech/schema.md)

- `ComponentNode` 数据结构
- 核心组件 Props 定义 (Table, Form, etc.)
- 交互动作枚举 (ActionType)
