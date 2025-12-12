# 低代码引擎 v1.1.0 需求文档：数据驱动核心版

## 1. 项目愿景与目标

### 1.1 核心理念

本次 v1.1.0 版本迭代旨在构建低代码引擎的**核心数据能力**。本阶段专注于让用户能够可视化的定义"后端"并打通数据链路。

**核心聚焦 (P0)**：数据建模、动态 Schema、与后端的连接。

### 1.2 核心目标

构建一套**闭环**的低代码数据流：
**定义数据模型 (Schema)** -> **自动生成 API** -> **物理层同步**

---

## 2. P0: 核心低代码能力 (数据对象引擎)

这是本阶段的唯一焦点。

### 2.1 可视化数据建模器

用户无需编写 SQL，通过 GUI 定义业务数据实体。

- **模型定义**：
  - 创建模型 (Model/Table)，例如 "Customer", "Order"。
  - 定义字段 (Fields)：支持 文本, 数字, 布尔, 日期, 枚举(Select), JSON。
  - **字段验证规则**：支持 `必填(required)`, `唯一(unique)`, `默认值(defaultValue)`, `正则约束(regex)`。
  - **关联关系 (Relationships)**：支持模型间 **1:N** 关联 (Foreign Key)，例如 "一个用户拥有多个订单"。
  - 系统字段自动注入：`id`, `created_at`, `updated_at`, `creator_id`。
- **物理层同步**：
  - 点击"发布"或"保存"时，底层自动在 Supabase 调用 `CREATE/ALTER TABLE`。
  - 自动创建相应的索引和外键约束。
  - 保持 Schema 定义(JSON) 与 物理表结构 的强一致性。

### 2.2 数据连接器 (Data Connector)

在编辑器运行时和应用预览时，提供统一的数据获取层。

- **通用 CRUD 接口**：
  - 前端组件通过统一的 `useQuery("model_name", { filter, sort, page })` 访问数据。
  - **基础能力**：必须支持 `等于/不等于` 过滤、`ASC/DESC` 排序、`limit/offset` 分页。
- **实时性**：利用 Supabase 的 Realtime 能力，实现数据变更的即时反馈。

### 2.3 页面设计器集成 (Data Consumption)

在页面设计器中，用户通过"数据源配置"与数据对象产生关联。

- **页面级数据源 (Page Data Source)**：
  - 在页面的"数据面板"中，添加一个数据源（如命名为 `myCustomers`），绑定到 P0 定义的 "Customer" 模型。
  - 支持配置初始加载参数（如 `limit`, `orderBy`）。
- **变量绑定 (Binding)**：
  - 组件属性支持表达式绑定，例如将表格的 `DataSource` 属性绑定为 `{{ myCustomers.data }}`。
  - 此机制解耦了"组件"与"模型"，组件只需接收标准数组即可。

---

## 3. 技术架构变更点

### 存储层

- 新增 `sys_schemas` 表：存储低代码平台的元数据（Table 定义）。
- 业务数据表：由 `sys_schemas` 动态生成。

### 逻辑层

- **Schema Engine**：解析 JSON Schema 并转换为 SQL 的核心模块。

---

## 4. 交付里程碑

1.  **MileStone 1 (Foundation)**: 完成 `Schema Engine` 和数据库动态创建能力。
2.  **MileStone 2 (UI)**: 完成数据模型设计器 (Data Designer) 面板。
