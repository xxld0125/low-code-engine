# v1.1.0 开发任务列表 (Implementation Plan)

本文档基于 `requirements.md` 和 `v1.1.0-hifi-design.md` 制定，聚焦于 "数据驱动核心版" 的开发落地。
**优先级定义**:

- **P0 (Blocker)**: 核心链路必须，阻碍后续开发。
- **P1 (Important)**: 关键功能，影响主要体验。
- **P2 (Nice to have)**: 优化项，可延后至 v1.1.x。

---

## Phase 0: 技术预研与架构定义 (Technical Spikes)

> **目标**: 在编写 UI 代码前，消除底层技术风险，确立数据契约。

- [ ] **0.1 [P0] 定义 Schema JSON 数据结构**
  - [ ] 确立 `DataModel` 和 `Field` 的 TypeScript Interface。
  - [ ] 确定 "Relation" 在 JSON 中的存储格式 (e.g., `relationId`, `targetModelId`, `type: 1:1/1:N`).
  - [ ] 输出: `src/types/data-engine.d.ts`

- [ ] **0.2 [P0] 验证 Supabase DDL 同步方案**
  - [ ] 调研方案 A: 使用 Supabase `pg-meta` API (需确认鉴权与权限)。
  - [ ] 调研方案 B: 编写 Postgres Function (`exec_sql`) + RPC 调用 (需评估安全性)。
  - [ ] **决策**: 选定 DDL 执行路径并编写 PoC (Proof of Concept) 代码。

- [ ] **0.3 [P0] 数据库元数据存储设计**
  - [ ] 设计系统表 `_sys_models`: 存储 Model 的 JSON 配置 (name, description, timestamp)。
  - [ ] 设计系统表 `_sys_fields`: 存储字段级别的 JSON 配置 (validation rules 等物理表无法完全承载的信息)。
  - [ ] 确立 "双写一致性" 策略: 如何保证 `_sys_` 表与真实物理表结构一致。

---

## Phase 1: 基础架构与路由 (Frontend Foundation)

- [ ] **1.1 [P0] 路由与导航**
  - [ ] 新增顶级路由 `/data-center`。
  - [ ] 更新顶部导航栏 (Header)，添加高亮逻辑。
  - [ ] 创建基础 Layout: 侧边栏/顶栏结构 (Admin Strict 风格)。

- [ ] **1.2 [P0] 全局样式注入**
  - [ ] 将新版 Design Tokens (Colors, Borders) 写入 `index.css`。
  - [ ] 封装/更新基础原子组件: `AppButton` (Sharp), `AppInput`, `StatusBadge`.

---

## Phase 2: 可视化建模器 UI (Visual Modeler)

- [ ] **2.1 [P0] 模型列表页 (Model List)**
  - [ ] 实现 Grid 布局的模型卡片。
  - [ ] 实现 "Create Model" 弹窗 (输入 Name, Code)。

- [ ] **2.2 [P0] 模型编辑器框架**
  - [ ] Header: 包含面包屑、保存/发布按钮、状态指示器。
  - [ ] Schema Table: 展示字段列表 (Name, Key, Type, Attributes)。
  - [ ] 实现 "字段拖拽/添加" 交互原型。

- [ ] **2.3 [P0] 核心字段配置**
  - [ ] 实现基础类型字段配置 (Text, Number, Boolean, Date)。
  - [ ] 实现字段属性面板: Key (标识符), Name (显示名).
  - [ ] **注意**: 确保字段 Key 的正则校验 (仅限字母下划线)。

- [ ] **2.4 [P0] 关系配置交互 (Complex)**
  - [ ] 设计并实现 "Relation Config" 面板。
  - [ ] 选择目标模型 (Select Target Model).
  - [ ] 定义关系类型 (HasOne, HasMany).
  - [ ] 自动生成外键字段名预览 (e.g., `customer_id`).

- [ ] **2.5 [P1] 高级字段与校验**
  - [ ] 实现 Enum/Select 选项配置 UI。
  - [ ] 实现 Validation Rules UI (Uniqueness, Required)。

---

## Phase 3: 状态管理与逻辑 (State & Logic)

- [ ] **3.1 [P0] 编辑器 Store (Pinia)**
  - [ ] `useModelStore`: 管理当前编辑的模型状态。
  - [ ] 实现 `draft` 机制: 本地修改不直接提交，点击保存才生效。
  - [ ] 实现 `isDirty` 检查: 离开页面未保存拦截。

- [ ] **3.2 [P1] 客户端校验逻辑**
  - [ ] 检查重复字段 Key。
  - [ ] 检查循环依赖 (Self-reference or circular relations)。

---

## Phase 4: 后端同步与执行 (Backend Execution)

- [ ] **4.1 [P0] DDL 生成器 (Schema Diff)**
  - [ ] 开发 `SchemaDiffService`: 比较 `Current JSON` vs `Previous JSON`。
  - [ ] 生成 SQL 操作列表: `ADD COLUMN`, `DROP COLUMN`, `ALTER COLUMN TYPE`.
  - [ ] **风险控制**: 对 `DROP` 操作增加二次确认警告。

- [ ] **4.2 [P0] 发布/同步 API**
  - [ ] 实现后端 API/Edge Function: 接收 Diff 或 JSON，执行事务性更新。
  - [ ] 步骤 1: 更新 `_sys_` 表。
  - [ ] 步骤 2: 执行 DDL 变更物理表。
  - [ ] 步骤 3 (Optional): 更新 RLS 策略 (默认仅 Authenticated 可读写)。

- [ ] **4.3 [P1] 错误处理与回滚**
  - [ ] 捕获 SQL 执行错误 (e.g., 类型转换失败)。
  - [ ] 确保前端能展示可读的数据库错误信息。

---

## Phase 5: 消费集成 (Integration)

- [ ] **5.1 [P0] Data Connector Hook**
  - [ ] 封装 `useDataQuery(modelId)`: 自动映射到 Supabase Client (`FROM table SELECT *`).
  - [ ] 支持基础过滤与排序参数。

- [ ] **5.2 [P1] 绑定选择器 (UI)**
  - [ ] 更新设计器中的数据绑定弹窗，从 `_sys_models` 读取元数据展示。

---

## Phase 6: 测试与验收 (QA & Safety)

- [ ] **6.1 [P0] 破坏性测试**
  - [ ] 测试重命名正在被使用的字段。
  - [ ] 测试删除含有数据的列 (验证是否有警告/报错)。
  - [ ] 测试类型变更 (String -> Number) 的数据兼容性。

- [ ] **6.2 [P0] API 连通性测试**
  - [ ] 验证生成的物理表是否能通过 Supabase Client 标准 SDK 访问。
  - [ ] 验证 RLS 是否生效 (匿名用户无法访问)。
