# Specification: Platform Engineering

## ADDED Requirements

### Requirement: [Platform.Versioning] Schema version history

平台**必须 (MUST)** 在每次保存操作时自动对页面 Schema 进行版本控制，并支持回滚。

#### Scenario: 保存时生成新版本

Given 我对页面进行了修改
When 我点击“保存”按钮
Then 历史列表中应该创建一个新的版本记录

#### Scenario: 回滚到旧版本

Given 我有该页面的多个历史版本
When 我选择一个较旧的版本并点击“回滚”
Then 当前编辑器的 Schema 应该被替换为所选版本的 Schema

### Requirement: [Platform.Codegen] Export React code

用户**应当 (SHALL)** 能够查看并将当前页面 Schema 导出为标准的 Next.js React 代码。

#### Scenario: 查看源代码

Given 我设计好了一个页面
When 我点击“查看代码”按钮
Then 应该打开一个模态框，显示该页面生成的 React/Next.js 代码
And 我应该能将代码复制到剪贴板
