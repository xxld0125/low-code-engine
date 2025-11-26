# 测试问题

- 1. 问题: 画板中选中组件-无删除组件功能
     期望: 选中画板中的组件, 选中框展示删除按钮, 点击删除选中的组件
- 2. 问题: 拖动左侧组件, 但是都未移动到画板中就放开拖拽, 画板还是新增了组件
     期望: 只有拖动到画板后松开拖拽才会在画板中新增组件
- 3. 问题: 文本组件属性面板不支持修改文本字体颜色
     期望: 文本组件属性面板支持修改文本字体颜色和背景颜色
- 4. 问题: 按钮组件属性面板中的EVENTS 配置 Add Actions后,此时切换到别的组件, 再切换回按钮组件, 之前配置的EVENTS消失了, 未保存
     期望: 按钮组件属性面板中的EVENTS 配置 Add Actions后,需要保存
- 5. 疑问: 表格和表单组件支持输入table name, 如果支持输入哪些table name, 输入任何的都可以吗, 可以具体讲解下这块的吗?
- 6. 问题: 配置后打开预览页, 页面提示报错:

```js
page.tsx:52 Schema validation failed: ZodError: [
  {
    "expected": "string",
    "code": "invalid_type",
    "path": [
      "rootId"
    ],
    "message": "Invalid input: expected string, received undefined"
  },
  {
    "expected": "record",
    "code": "invalid_type",
    "path": [
      "components"
    ],
    "message": "Invalid input: expected record, received undefined"
  }
]
    at initRuntime (page.tsx:38:42)
```

期望: 预览页正常打开
