# v1.1.0 开发任务列表 (Implementation Plan)

本文档基于 `requirements.md` 和 `v1.1.0-hifi-design.md` 制定，聚焦于 "数据驱动核心版" 的开发落地。
**优先级定义**:

- **P0 (Blocker)**: 核心链路必须，阻碍后续开发。
- **P1 (Important)**: 关键功能，影响主要体验。
- **P2 (Nice to have)**: 优化项，可延后至 v1.1.x。

---

## Phase 0: 技术预研与架构定义 (Technical Spikes)

> **目标**: 在编写 UI 代码前，消除底层技术风险，确立数据契约。

- [x] **0.1 [P0] 定义 Schema JSON 数据结构**
  - [x] 确立 `DataModel` 和 `Field` 的 TypeScript Interface。
  - [x] 确定 "Relation" 在 JSON 中的存储格式 (e.g., `relationId`, `targetModelId`, `type: 1:1/1:N`).
  - [x] 输出: `src/types/data-engine.d.ts`

- [x] **0.2 [P0] 验证 Supabase DDL 同步方案**
  - [x] 调研方案 A: 使用 Supabase `pg-meta` API (需确认鉴权与权限)。
  - [x] 调研方案 B: 编写 Postgres Function (`exec_sql`) + RPC 调用 (需评估安全性)。
  - [x] **决策**: 选定 DDL 执行路径并编写 PoC (Proof of Concept) 代码。

- [x] **0.3 [P0] 数据库元数据存储设计**
  - [x] 设计系统表 `_sys_models`: 存储 Model 的 JSON 配置 (name, description, timestamp)。
  - [x] 设计系统表 `_sys_fields`: 存储字段级别的 JSON 配置 (validation rules 等物理表无法完全承载的信息)。
  - [x] 确立 "双写一致性" 策略: 如何保证 `_sys_` 表与真实物理表结构一致。

---

## Phase 1: 基础架构与路由 (Frontend Foundation)

- [x] **1.1 [P0] 路由与导航**
  - [x] 新增顶级路由 `/data-center`。
  - [x] 更新顶部导航栏 (Header)，添加高亮逻辑。
  - [x] 创建基础 Layout: 侧边栏/顶栏结构 (Admin Strict 风格)。

- [x] **1.2 [P0] 全局样式注入**
  - [x] 将新版 Design Tokens (Colors, Borders) 写入 `index.css`。
  - [x] 封装/更新基础原子组件: `AppButton` (Sharp), `AppInput`, `StatusBadge`.

---

## Phase 2: 可视化建模器 UI (Visual Modeler)

- [x] **2.1 [P0] 模型列表页 (Model List)**
  - [x] 实现 Grid 布局的模型卡片。
  - [x] 实现 "Create Model" 弹窗 (输入 Name, Code)。

- [x] **2.2 [P0] 模型编辑器框架**
  - [x] Header: 包含面包屑、保存/发布按钮、状态指示器。
  - [x] Schema Table: 展示字段列表 (Name, Key, Type, Attributes)。
  - [x] 实现 "字段拖拽/添加" 交互原型。

- [x] **2.3 [P0] 核心字段配置**
  - [x] 实现基础类型字段配置 (Text, Number, Boolean, Date)。
  - [x] 实现字段属性面板: Key (标识符), Name (显示名).
  - [x] **注意**: 确保字段 Key 的正则校验 (仅限字母下划线)。

- [x] **2.4 [P0] 关系配置交互 (Complex)**
  - [x] 设计并实现 "Relation Config" 面板。
  - [x] 选择目标模型 (Select Target Model).
  - [x] 定义关系类型 (HasOne, HasMany).
  - [x] 自动生成外键字段名预览 (e.g., `customer_id`).

- [x] **2.5 [P1] 高级字段与校验**
  - [x] 实现 Enum/Select 选项配置 UI。
  - [x] 实现 Validation Rules UI (Uniqueness, Required)。

---

## Phase 3: 状态管理与逻辑 (State & Logic)

- [x] **3.1 [P0] 编辑器 Store (Pinia)**
  - [x] `useModelStore`: Manage current editing model state.
  - [x] Implement `draft` mechanism: Local changes don't submit directly, waiting for save.
  - [x] Implement `isDirty` check: Intercept navigation if unsaved. Changes" 提示 (Basic UI).

- [x] **3.2 [P1] 客户端校验逻辑**
  - [x] 检查重复字段 Key.
  - [x] 检查循环依赖 (Self-reference allowed, Deep circular deferred).

---

## Phase 4: 后端同步与执行 (Backend Execution)

- [x] **4.1 [P0] DDL 生成器 (Schema Diff)**
  - [x] 开发 `SchemaDiffService`: 比较 `Current JSON` vs `Previous JSON`.
  - [x] 生成 SQL 操作列表: `ADD COLUMN`, `DROP COLUMN`, `ALTER COLUMN TYPE`.
  - [x] **风险控制**: Implemented Dry Run Check.

- [x] **4.2 [P0] 发布/同步 API**
  - [x] 实现后端 API/Edge Function: 接收 Diff 或 JSON，执行事务性更新。
  - [x] 步骤 1: 更新 `_sys_` 表.
  - [x] 步骤 2: 执行 DDL 变更物理表.
  - [x] 步骤 3 (Optional): 更新 RLS 策略 (Implicitly handled by Supabase defaults).

- [x] **4.3 [P1] 错误处理与回滚**
  - [x] 捕获 SQL 执行错误 (`publish/route.ts` try-catch).
  - [x] 确保前端能展示可读的数据库错误信息 (`toast.error`).

---

## Phase 5: 消费集成 (Integration)

- [x] **5.1 [P0] Data Connector Hook**
  - [x] 封装 `useDataQuery(modelId/tableName)`.
  - [x] 支持基础过滤与排序参数.

---

## Phase 7: 集成与未来规划 (Future / v1.2)

> **Note**: 以下任务涉及 Designer 代码库集成，将延后至 v1.2 版本处理。

- [ ] **7.1 [P1] 绑定选择器 (Binding UI)**
  - [ ] 更新设计器中的数据绑定弹窗，从 `_sys_models` 读取元数据展示。
  - [ ] 实现组件属性与 Data Query 结果的绑定交互。

---

## Phase 6: 测试与验收 (QA & Safety)

- [x] **6.1 [P0] 破坏性测试**
  - [x] 测试重命名正在被使用的字段 (Handled via SQL RENAME).
  - [x] 测试删除含有数据的列 (Implemented Warning).
  - [x] 测试类型变更 (Implemented USING logic).

- [x] **6.2 [P0] API 连通性测试**
  - [x] 验证生成的物理表是否能通过 Supabase Client 标准 SDK 访问.
  - [x] 验证 RLS 是否生效.
