# 低代码引擎 v1.2.0 需求文档：智能组件与深度集成

## 1. 项目愿景

v1.2.0 将在 v1.1.0 构建的数据核心基础上，进一步打通 **"数据 -> UI"** 的最后一公里。本版本的核心目标是实现**智能组件体系**和**深度集成的数据消费能力**，大幅降低页面搭建成本。

---

## 2. 核心功能需求

### 2.1 [P0] 遗留功能补全 (Rollover from v1.1.0)

以下功能原定于 v1.1.0 发布，现延期至本版本交付。

#### 2.1.1 高级字段配置

- **默认值 (Default Value)**: 在字段配置面板中，支持设置静态默认值。
- **正则校验 (Regex Validation)**: 支持自定义正则表达式约束字段输入格式。

#### 2.1.2 页面设计器集成 (Page Designer Data Integration)

在页面编辑器中提供完整的数据源管理能力：

- **页面数据源面板 (Data Source Panel)**:
  - 管理页面的数据查询实例（如 `myCustomers`）。
  - 配置查询参数：过滤 (Filter)、排序 (Sort)、分页 (Pagination)。
- **变量绑定 UI (Binding Picker)**:
  - 提供可视化的绑定弹窗，列出可用数据源及其属性。
  - 支持将组件属性（如 Table Data, Text Content）绑定到 `{{ queries.myCustomers.data }}`。

### 2.2 [P1] 智能组件 (Smart Components)

#### 2.2.1 智能表单 (Smart Form)

- **模型驱动生成**: 拖入 Smart Form 组件并选择数据模型，自动生成对应的表单字段。
- **类型映射**:
  - `Text` -> Input
  - `Boolean` -> Switch
  - `Select` -> Select Dropdown
  - `Date` -> DatePicker (需新增)
- **双向验证**: 前端表单自动应用模型定义的 `required`, `regex` 等校验规则。

#### 2.2.2 智能表格 (Smart Table)

- **增强版表格组件**: 替代 v1.1.0 的简易表格。
- **服务端集成**: 内置分页、排序、搜索逻辑，直接与 Supabase 交互，无需手动配置 API 请求。
- **列配置增强**: 支持列宽调整、列显示/隐藏、列排序。

### 2.3 [P2] 原子组件扩充 (Component Library Expansion)

为了支持更丰富的业务场景，需要补充以下基础组件：

- **输入类**:
  - `DatePicker`: 日期选择器。
  - `RemoteSelect`: 支持远程搜索的下拉框。
  - `Upload`: 文件上传组件 (对接 Storage)。
  - `RichText`: 富文本编辑器。
- **展示类**:
  - `Tag`: 标签展示。
  - `Avatar`: 头像。
  - `StatusIndicator`: 状态指示点。
  - `Card`: 通用卡片容器。

---

## 3. 技术挑战

- **Binding Context**: 设计器运行时如何解析 `{{ }}` 表达式并建立响应式依赖。
- **Smart Component Protocol**: 定义组件如何读取 Schema 元数据并动态渲染。
