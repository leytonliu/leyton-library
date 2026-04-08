# @leyton/cms

CMS (Content Management System) 组件系统，基于 Vue 3 的声明式页面渲染引擎，支持通过 JSON 配置动态渲染页面，适用于小程序和 H5 多端场景。

## 特性

- 🎯 **声明式渲染** - 通过 JSON 配置渲染页面，无需编写模板代码
- 📱 **多端支持** - 完美支持 uni-app，一套代码编译到小程序和 H5
- 🧩 **组件丰富** - 内置丰富的容器组件和基础组件
- 🔗 **数据绑定** - 支持动态数据绑定，自动向上查找数据
- ⚡ **高度自适应** - 支持容器高度自动计算
- 🎨 **样式灵活** - 支持行内样式和类名定制

## 安装

```bash
# npm
npm install @leyton/cms

# pnpm
pnpm add @leyton/cms

# yarn
yarn add @leyton/cms
```

## 快速开始

### 基础用法

```vue
<template>
  <CmsPage :data="pageConfig" :env-config="envConfig" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CmsPage, type CmsPageConfig } from '@leyton/cms';

const pageConfig = ref<CmsPageConfig>({
  name: '首页',
  style: { backgroundColor: '#f5f5f5' },
  childrenData: [
    {
      componentId: 'banner-001',
      componentCode: 'image',
      componentName: 'Banner图',
      data: { url: 'https://example.com/banner.jpg' },
      style: { width: '100%', height: '200px' },
      childrenData: [],
    },
    {
      componentId: 'title-001',
      componentCode: 'text',
      componentName: '标题',
      data: { text: '欢迎来到首页' },
      style: { fontSize: '18px', fontWeight: 'bold', textAlign: 'center' },
      childrenData: [],
    },
  ],
});

const envConfig = ref({
  env: 'production',
});
</script>
```

### 使用预览组件

```vue
<template>
  <CmsPreview :data="pageConfig" :env-config="envConfig" />
</template>

<script setup lang="ts">
import { CmsPreview } from '@leyton/cms';
</script>
```

## 组件清单

### 基础组件

| 组件 | componentCode | 说明 |
|------|---------------|------|
| CmsText | `text` | 文本展示，支持单行/多行省略 |
| CmsImage | `image` | 图片展示，支持多种填充模式 |
| CmsButton | `button` | 按钮组件 |
| CmsIcon | `icon` | 图标组件 |

### 容器组件

| 组件 | componentCode | 说明 |
|------|---------------|------|
| CmsRowsContainer | `rows-container` | 纵向排列容器 |
| CmsColumnContainer | `column-container` | 横向排列容器 |
| CmsCarouselContainer | `carousel-container` | 轮播容器 |
| CmsFixedSizeContainer | `fixed-size-container` | 固定尺寸容器 |
| CmsCardStack | `card-stack` | 卡片堆叠容器 |
| CmsDialogContainer | `dialog-container` | 弹窗容器 |
| CmsTabContainer | `tab-container` | 标签页容器 |

### 业务组件

| 组件 | componentCode | 说明 |
|------|---------------|------|
| CmsProductList | `product-list` | 商品列表组件 |

## API 文档

### CmsPageConfig

```typescript
interface CmsPageConfig {
  name: string;              // 页面名称
  style: CSSProperties;      // 页面样式
  childrenData: CmsComponentConfig[];  // 组件树
  gutter?: number;           // 子组件间距
}
```

### CmsComponentConfig

```typescript
interface CmsComponentConfig {
  componentId: string;       // 组件唯一 ID
  componentCode: string;     // 组件类型编码
  componentName: string;     // 组件展示名称
  data: CmsComponentData;    // 组件数据
  style: CSSProperties;      // 组件样式
  childrenData: CmsComponentConfig[];  // 嵌套子组件
  actions?: CmsActionConfig; // 交互行为配置
}
```

### CmsComponentData

```typescript
interface CmsComponentData {
  visibleFlag?: boolean | number;  // 可见性控制
  [key: string]: any;              // 其他自定义数据
}
```

## 进阶用法

### 数据绑定

支持使用 `@@` 前缀标识绑定值：

```json
{
  "componentId": "text-001",
  "componentCode": "text",
  "data": {
    "text": "@@productName"  // 将自动查找 productName 值
  }
}
```

### 注册自定义动作

```typescript
import { createCmsActionRender, customActionRender } from '@leyton/cms';

const actionRender = createCmsActionRender(bindingValue);

// 注册跳转动作
actionRender.registryActionRender('navigate', (data, bindValue) => {
  const url = data.action.data.url;
  uni.navigateTo({ url });
});

// 注册弹窗动作
actionRender.registryActionRender('showModal', (data, bindValue) => {
  uni.showModal({
    title: '提示',
    content: data.action.data.message,
  });
});
```

### 容器嵌套示例

```json
{
  "componentId": "container-001",
  "componentCode": "rows-container",
  "componentName": "主容器",
  "data": { "gutter": 10 },
  "style": { "padding": "20px" },
  "childrenData": [
    {
      "componentId": "col-001",
      "componentCode": "column-container",
      "componentName": "横向排列",
      "data": { "gutter": 10 },
      "childrenData": [
        { "componentCode": "image", "data": { "url": "..." } },
        { "componentCode": "text", "data": { "text": "描述文字" } }
      ]
    }
  ]
}
```

## 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm run build

# 测试
pnpm run test
```

## 依赖

- Vue 3.x
- @dcloudio/uni-app (用于 uni-app 项目)

## 许可证

MIT
