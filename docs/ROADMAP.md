# 项目路线图 (Roadmap)

本文档记录了低代码引擎的长期规划与待办特性。

## 📅 v1.2.0: 智能组件体系 (Smart Components)

**目标**: 让组件能够"读懂" v1.1.0 定义的数据模型，实现 UI 的自动推断与生成。

### 1. 智能表单 (Smart Form)

- **模型驱动生成**: 拖入 Smart Form 并绑定 Model，自动生成 Input/Select/Switch。
- **双向验证**: 自动应用后端定义的必填、正则等验证规则。

### 2. 智能表格 (Smart Table)

- **模型绑定**: 自动生成列配置。
- **服务端集成**: 内置分页、排序、搜索，无需前端代码。

### 3. 原子组件扩充

- **输入类**: RemoteSelect (远程搜索), DatePicker, Upload (Storage对接), RichText.
- **展示类**: Tag, Avatar, StatusIndicator, Card.

---

## 📅 v1.3.0: 功能增强与运营 (Operation & Enhancement)

### 1. 数据生命周期管理

- **软删除**: 引入 `deleted_at` 机制，支持数据恢复。
- **操作审计**: 记录关键数据的变更日志 (Audit Log)。

### 2. 数据导入导出

- Excel/CSV 批量导入与导出。
- 简单的 ETL 工具。

### 3. 细粒度权限 (RBAC/ABAC)

- 可视化的权限配置面板 (Row Level Security)。
- 字段级权限控制。

---

## 📅 v1.4.0: AI 能力集成 (AI Powered)

**目标**: 利用 LLM 进一步降低搭建门槛。

### 1. Prompt to Schema

- 用户输入自然语言（"我要一个请假流程，包含开始时间、结束时间和原因"）。
- AI 自动生成 v1.1.0 格式的 JSON Schema 并创建表。

### 2. Copilot 侧边栏

- 解释当前页面的配置。
- 生成简单的 JavaScript 逻辑代码。

---

## 🔮 待评估特性 (Backlog)

- **多环境支持**: 区分 Dev/Staging/Prod 环境的数据源。
- **多人协同编辑**: 基于 CRDT 的画布协同。
