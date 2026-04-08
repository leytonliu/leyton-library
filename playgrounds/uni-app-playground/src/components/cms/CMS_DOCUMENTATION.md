# CMS 组件系统文档

CMS (Content Management System) 组件系统是一个基于 Vue 3 的声明式页面渲染引擎，支持通过 JSON 配置动态渲染页面，适用于小程序和 H5 多端场景。

## 架构概览

```
cms-page.vue (页面入口)
    ↓
cms-preview.vue (预览/渲染器)
    ↓
cms-base-component.vue (组件分发器)
    ↓
[具体组件] text, image, button, rows-container, etc.
```

## 核心概念

### 1. 页面配置 (CmsPageConfig)

页面级别的配置，定义页面的整体结构和样式。

```typescript
interface CmsPageConfig {
  name: string;              // 页面名称
  style: CSSProperties;      // 页面样式
  childrenData: CmsComponentConfig[];  // 组件树
  gutter?: number;           // 子组件间距
}
```

### 2. 组件配置 (CmsComponentConfig)

每个组件的基础定义，所有组件都遵循此结构。

```typescript
interface CmsComponentConfig {
  componentId: string;       // 组件唯一 ID
  componentCode: string;     // 组件类型编码
  componentName: string;     // 组件展示名称
  data: CmsComponentData;    // 组件绑定数据
  style: CSSProperties;      // 组件样式
  childrenData: CmsComponentConfig[];  // 嵌套子组件
  actions?: CmsActionConfig; // 交互行为配置
}
```

### 3. 数据绑定系统

支持动态数据绑定，通过 `createCmsBindingValue` 实现。

- **绑定值格式**: 使用特定 code 标识绑定类型
- **爬树机制**: 当组件无法在当前数据中找到绑定值时，会向上查找父组件数据
- **伪造数据**: 支持通过 `fakeDataManager` 注入测试数据

```typescript
// 绑定值配置示例
interface CmsBindingValueConfig {
  code: string;              // 绑定标识
  name: string;              // 绑定名称
  getter: (data) => { done: boolean; val: any };  // 数据获取函数
}
```

### 4. 动作系统 (Action System)

处理组件的交互行为，如点击跳转、弹窗等。

```typescript
interface CmsActionConfig {
  code: string;              // 动作类型
  data: any;                 // 动作参数
}

// 注册自定义动作
actionRender.registryActionRender('navigate', (data, bindValue) => {
  // 处理导航逻辑
});
```

## 组件清单

### 基础组件

| 组件 | componentCode | 功能说明 |
|------|---------------|----------|
| CmsText | `text` | 文本展示，支持单行/多行省略 |
| CmsImage | `image` | 图片展示，支持多种填充模式 |
| CmsButton | `button` | 按钮，支持点击动作 |
| CmsIcon | `icon` | 图标组件 |

### 容器组件

| 组件 | componentCode | 功能说明 |
|------|---------------|----------|
| CmsRowsContainer | `rows-container` | 纵向排列容器，支持子组件间距 |
| CmsColumnContainer | `column-container` | 横向排列容器，支持子组件间距 |
| CmsCarouselContainer | `carousel-container` | 轮播容器 |
| CmsFixedSizeContainer | `fixed-size-container` | 固定尺寸容器 |
| CmsCardStack | `card-stack` | 卡片堆叠容器 |
| CmsDialogContainer | `dialog-container` | 弹窗容器 |
| CmsTabContainer | `tab-container` | 标签页容器 |

### 业务组件

| 组件 | componentCode | 功能说明 |
|------|---------------|----------|
| CmsProductList | `product-list` | 商品列表，支持数据绑定获取商品信息 |

## 组件开发规范

### 1. 组件基础结构

```vue
<template>
  <view
    :class="classes"
    :data-component="data.componentCode"
    :style="styles"
    @tap="handleTapBaseContainer"
  >
    <!-- 组件内容 -->
  </view>
</template>

<script lang="ts" setup>
import { CmsBaseComponentProps } from '../../cms';
import { cmsBaseComponentDefaults } from '../utils/constants';
import useCmsComponent from '../hooks/useCmsComponent';

defineOptions({
  name: 'CmsXxx',
  options: {
    virtualHost: true,        // 启用虚拟宿主节点
    styleIsolation: 'shared', // 解除样式隔离
  },
});

const props = withDefaults(defineProps<CmsBaseComponentProps>(), {
  ...cmsBaseComponentDefaults,
});

const {
  classes,
  styles,
  getBindingValue,
  handleTapBaseContainer,
} = useCmsComponent(props);
</script>
```

### 2. 注册新组件

1. 在 `packages/components/` 下创建组件文件
2. 在 `cms-base-component.vue` 中添加条件渲染分支
3. 导入并注册组件

```vue
<!-- cms-base-component.vue -->
<cms-xxx
  v-else-if="data.componentCode === 'xxx' && isVisible"
  :data="data"
  :index="index"
  :key="`xxx-${data.componentId}`"
  :children-styles="childrenStyles"
/>
```

### 3. 高度自适应

对于需要动态计算高度的组件（如图片），需要手动上报高度：

```typescript
const { measureAndReportHeight } = useCmsComponent(props, {
  autoReportHeightOnMounted: false,  // 关闭自动上报
});

// 在内容加载完成后手动上报
const onImageLoad = () => {
  nextTick(() => {
    measureAndReportHeight();
  });
};
```

## Hooks API

### useCmsComponent

核心 Hook，提供组件开发所需的基础能力。

```typescript
const {
  // 基础属性
  envConfig,           // 环境配置
  cmsPageConfig,       // 页面配置
  bindingValue,        // 绑定值管理器

  // 样式相关
  styleObject,         // 样式对象
  styles,              // 样式字符串
  classes,             // 类名数组

  // 状态
  isVisible,           // 是否可见
  isBaseComponent,     // 是否为 BaseComponent

  // 方法
  getBindingValue,     // 获取绑定值
  handleTapBaseContainer,  // 处理点击事件
  measureAndReportHeight,  // 测量并上报高度
} = useCmsComponent(props, options);
```

**Options:**

| 参数 | 类型 | 说明 |
|------|------|------|
| `isBaseComponent` | `boolean` | 是否为 Base Component |
| `autoReportHeightOnMounted` | `boolean` | 是否在 onMounted 自动上报高度 |
| `adjustStyles` | `(styles) => styles` | 调整最终样式的函数 |

## 工具函数

### 样式转换

```typescript
import { convertStyleToString } from './utils/utils';

// CSSProperties 转内联样式字符串
const styleString = convertStyleToString({ color: 'red', fontSize: '14px' });
// 结果: "color: red; font-size: 14px;"
```

### 获取首个有效值

```typescript
import { getFirstDefinedValue } from './utils/utils';

// 优先使用组件配置，未定义则使用页面配置
const gutter = getFirstDefinedValue(componentGutter, pageGutter);
```

## 使用示例

### 基础用法

```vue
<template>
  <cms-preview :data="pageConfig" :env-config="envConfig" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CmsPreview from './components/cms/packages/cms-preview.vue';

const pageConfig = ref({
  name: '首页',
  style: { backgroundColor: '#f5f5f5' },
  childrenData: [
    {
      componentId: 'header-001',
      componentCode: 'image',
      componentName: '顶部图片',
      data: { url: 'https://example.com/banner.jpg' },
      style: { width: '100%', height: '200px' },
      childrenData: [],
    },
    {
      componentId: 'title-001',
      componentCode: 'text',
      componentName: '标题',
      data: { text: '欢迎来到首页' },
      style: { fontSize: '18px', fontWeight: 'bold' },
      childrenData: [],
    },
  ],
});

const envConfig = ref({
  env: 'production',
  getProductList: async ({ params }) => {
    // 获取商品列表
    return fetchProducts(params.codes);
  },
});
</script>
```

### 注册自定义动作

```typescript
import { customActionRender } from './action/customActionRender';
import { createCmsActionRender } from './action/createCmsActionRender';

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

## 配置示例

### 轮播容器

```json
{
  "componentId": "carousel-001",
  "componentCode": "carousel-container",
  "componentName": "轮播图",
  "data": {
    "autoplay": true,
    "interval": 3000,
    "indicatorDots": true
  },
  "style": { "height": "200px" },
  "childrenData": [
    { "componentCode": "image", "data": { "url": "..." } },
    { "componentCode": "image", "data": { "url": "..." } }
  ]
}
```

### 商品列表

```json
{
  "componentId": "product-list-001",
  "componentCode": "product-list",
  "componentName": "商品列表",
  "data": {
    "productCodes": ["P001", "P002", "P003"]
  },
  "style": { "padding": "10px" },
  "childrenData": []
}
```

### 按钮带点击动作

```json
{
  "componentId": "btn-001",
  "componentCode": "button",
  "componentName": "立即购买",
  "data": {
    "text": "立即购买",
    "type": "primary"
  },
  "style": { "width": "100%", "marginTop": "20px" },
  "actions": {
    "code": "navigate",
    "data": { "url": "/pages/order/index" }
  }
}
```

## 注意事项

1. **样式隔离**: 所有组件都设置了 `styleIsolation: 'shared'` 和 `virtualHost: true`，确保样式正确应用
2. **组件 ID**: 每个组件必须有唯一的 `componentId`，用于数据绑定和高度计算
3. **图片组件**: 图片加载完成后需要手动调用 `measureAndReportHeight` 上报高度
4. **可见性控制**: 组件支持通过 `data.visibleFlag` 控制显示/隐藏
5. **性能优化**: 使用 `v-if="isVisible"` 避免不可见组件的渲染开销
