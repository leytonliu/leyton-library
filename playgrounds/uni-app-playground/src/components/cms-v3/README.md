# CMS 组件 Vue2 到 Vue3 迁移指南

## 📋 迁移概述

已成功将 `src/components/cms` 目录下的 Vue2 组件迁移到 `src/components/cms-v3` 目录，使用 Vue3 的 Composition API。

## ✅ 已完成的迁移

### 1. 核心架构 (100%)
- ✅ 所有 utils 工具函数
- ✅ Vue2 Mixins → Vue3 Composables 转换
- ✅ binding 数据绑定系统
- ✅ action 动作处理系统
- ✅ stateProvider 状态管理系统

### 2. 核心组件 (100%)
- ✅ `cms-page.vue` - 主入口组件
- ✅ `cms-preview.vue` - 预览组件
- ✅ `cms-base-component.vue` - 基础组件路由

### 3. 具体组件 (已复制，需按模板迁移)
已将所有 30+ 个具体组件复制到 cms-v3/packages/components/ 目录

## 🔄 主要变更

### Vue2 → Vue3 迁移模式

#### 1. Options API → Composition API (setup语法)

**Vue2 写法:**
```vue
<script>
export default {
  name: 'CmsButton',
  mixins: [CmsComponentMixin],
  props: {
    data: { type: Object, required: true },
    index: { type: Number, required: true },
  },
  computed: {
    buttonClasses() {
      return ['cms-button', `cms-button-size-${this.data.data.size}`];
    }
  },
  methods: {
    handleClick() {
      this.actionRender.handleTapBaseContainer(this.data);
    }
  }
}
</script>
```

**Vue3 写法:**
```vue
<script setup>
import { computed } from 'vue';
import { useCmsComponent } from '@/components/cms-v3/packages/utils/useCmsComponent';

const props = defineProps({
  data: { type: Object, required: true },
  index: { type: Number, required: true },
});

const { classes, styles, getBindingValue, handleTapBaseContainer } = useCmsComponent(props);

const buttonClasses = computed(() => {
  return ['cms-button', `cms-button-size-${props.data.data.size}`];
});
</script>
```

#### 2. Mixin → Composable

**Vue2 Mixin:**
```javascript
// CmsComponentMixin.js
export const CmsComponentMixin = {
  inject: ['cmsPageData', 'bindingValue'],
  computed: {
    styles() {
      return convertStyleToString(this.styleObject);
    }
  },
  methods: {
    getBindingValue(value) {
      return this.bindingValue.getBindingValue(value, this.data);
    }
  }
}
```

**Vue3 Composable:**
```javascript
// useCmsComponent.js
import { computed, inject } from 'vue';

export function useCmsComponent(props) {
  const cmsPageData = inject('cmsPageData', {});
  const bindingValue = inject('bindingValue', {});

  const styles = computed(() => {
    return convertStyleToString(styleObject.value);
  });

  const getBindingValue = (value) => {
    return bindingValue.getBindingValue(value, props.data);
  };

  return {
    styles,
    getBindingValue,
    // ... 其他返回值
  };
}
```

#### 3. Vuex 使用方式

**Vue2:**
```javascript
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['activeTabbar']),
    ...mapState({
      userInfo: (state) => state.user.userInfo
    })
  }
}
```

**Vue3:**
```javascript
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const activeTabbar = computed(() => store.state.activeTabbar);
const userInfo = computed(() => store.state.user.userInfo);
```

#### 4. 生命周期钩子

**Vue2:**
```javascript
export default {
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.cleanup();
  }
}
```

**Vue3:**
```javascript
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  init();
});

onUnmounted(() => {
  cleanup();
});
```

## 📁 目录结构

```
src/components/cms-v3/
├── cms-page.vue                    # ✅ 主入口组件
├── packages/
│   ├── cms-preview.vue             # ✅ 预览组件
│   ├── cms-base-component.vue      # ✅ 基础路由组件
│   ├── utils/                      # ✅ 工具函数 (Vue3版本)
│   │   ├── useCmsComponent.js      # Composition API 封装
│   │   ├── usePageScroll.js
│   │   ├── useImageRect.js
│   │   ├── createAutoGetRect.js
│   │   ├── deepcopy.js
│   │   ├── dfd.js
│   │   ├── throttle.js
│   │   └── ... (其他工具)
│   ├── binding/                    # ✅ 数据绑定系统
│   │   ├── createCmsBindValue.js
│   │   └── custom/
│   ├── action/                     # ✅ 动作处理系统
│   │   ├── createCmsActionRender.js
│   │   └── customActionRender.js
│   ├── stateProvider/              # ✅ 状态管理
│   │   ├── createCmsStateProvider.js
│   │   └── customStateProvider.js
│   └── components/                 # 🔄 具体组件(已复制，需迁移)
│       ├── cms-image.vue
│       ├── cms-button.vue
│       ├── cms-text.vue
│       ├── cms-column-container.vue
│       ├── cms-rows-container.vue
│       └── ... (30+ 个组件)
```

## 🚀 如何完成剩余组件迁移

### 步骤 1: 选择一个组件
例如: `src/components/cms-v3/packages/components/cms-column-container.vue`

### 步骤 2: 应用迁移模板

```vue
<template>
  <!-- 模板部分通常不需要大改，只需调整事件修饰符 -->
  <view :class="classes" :style="styles" @tap="handleTapBaseContainer">
    <!-- 原有内容 -->
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useCmsComponent } from '@/components/cms-v3/packages/utils/useCmsComponent';

// 1. 定义 props
const props = defineProps({
  data: { type: Object, required: true },
  index: { type: Number, required: true },
  childrenStyles: {},
  autoGetRect: { type: String },
  isFirstFloorNode: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: null },
});

// 2. 如果需要 emit
const emit = defineEmits(['event-name']);

// 3. 使用 composable 获取通用功能
const {
  classes,
  styles,
  getBindingValue,
  handleTapBaseContainer,
  // ... 根据需要解构更多
} = useCmsComponent(props);

// 4. 如果需要 store
const store = useStore();

// 5. 定义响应式数据
const someData = ref(null);

// 6. 定义计算属性
const computedValue = computed(() => {
  // 使用 props.xxx 而不是 this.xxx
  return props.data.something;
});

// 7. 定义方法
const someMethod = () => {
  // 直接使用变量，不需要 this
  console.log(someData.value);
};

// 8. 监听器
watch(() => props.data, (newVal) => {
  // 处理变化
}, { immediate: true });

// 9. 生命周期
onMounted(() => {
  // 初始化
});
</script>

<style lang="scss">
/* 样式部分通常不需要修改 */
</style>
```

### 步骤 3: 常见迁移点检查清单

- [ ] 移除 `export default { ... }`
- [ ] 添加 `<script setup>`
- [ ] 将 `mixins: [CmsComponentMixin]` 替换为 `useCmsComponent(props)`
- [ ] 将 `this.xxx` 改为 `xxx.value` (响应式数据) 或 `props.xxx` (props)
- [ ] 将 `mapState` 改为 `useStore()`
- [ ] 将 `mounted` 改为 `onMounted`
- [ ] 将 `beforeDestroy` 改为 `onUnmounted`
- [ ] 将 `watch` 对象改为 `watch()` 函数调用
- [ ] 如果使用 `$refs`，改用 `ref()` 和 `template ref`
- [ ] 更新导入路径: `@/components/cms` → `@/components/cms-v3`

## 🔧 使用新的 CMS-V3 组件

### 在页面中使用:

```vue
<template>
  <cms-page
    :env="env"
    :page-type-code="pageTypeCode"
    :page-code="pageCode"
    @update-nav-title="handleUpdateTitle"
  />
</template>

<script setup>
import CmsPage from '@/components/cms-v3/cms-page.vue';

const pageTypeCode = ref('INDEX');
const env = ref({});

const handleUpdateTitle = (title) => {
  uni.setNavigationBarTitle({ title });
};
</script>
```

## 📚 关键 Composable 说明

### `useCmsComponent(props, options)`

这是最重要的 composable，封装了所有 CMS 组件的通用逻辑。

**返回值:**
- `classes` - 组件 CSS 类名
- `styles` - 组件样式字符串
- `styleObject` - 组件样式对象
- `getBindingValue(value)` - 获取绑定值
- `handleTapBaseContainer()` - 处理点击事件
- `getRect(queryRectPrepare)` - 获取元素尺寸
- `isComputedHidden` - 是否隐藏
- `activeTabbar` / `activeMallTabbar` - 当前激活的标签
- `cmsPageData`, `bindingValue`, `actionRender`, `stateProvider`, `env` - 注入的依赖

**示例:**
```javascript
const {
  classes,
  styles,
  getBindingValue,
  handleTapBaseContainer
} = useCmsComponent(props);
```

## 🎯 优先迁移顺序建议

1. **容器类组件** (影响布局)
   - cms-column-container.vue
   - cms-rows-container.vue
   - cms-grid-container.vue
   - cms-fixed-size-container.vue

2. **交互类组件** (用户操作)
   - cms-tabs.vue
   - cms-tab-container.vue
   - cms-carousel-container.vue

3. **内容类组件** (展示内容)
   - cms-product-list.vue
   - cms-rich-text.vue
   - cms-video.vue

4. **其他组件** (按需迁移)

## ⚠️ 注意事项

1. **路径引用**: 所有导入路径需要从 `@/components/cms` 改为 `@/components/cms-v3`

2. **uni-app API**: uni-app 的 API 调用方式在 Vue3 中保持不变

3. **样式**: SCSS 样式部分通常不需要修改

4. **props 验证**: Vue3 的 props 验证语法与 Vue2 基本一致

5. **依赖注入**: 使用 `inject()` 替代 `inject: []` 配置

6. **事件**: 使用 `defineEmits()` 定义事件，使用 `emit()` 触发

## 🐛 常见问题

### Q: 如何访问全局属性 (如 $http, $Route)?
A: 使用 `getCurrentInstance()`:
```javascript
import { getCurrentInstance } from 'vue';

const instance = getCurrentInstance();
const http = instance.proxy.$http;
```

### Q: template ref 如何使用?
A:
```vue
<template>
  <view ref="containerRef">Content</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const containerRef = ref(null);

onMounted(() => {
  console.log(containerRef.value); // DOM 元素
});
</script>
```

### Q: provide/inject 如何使用?
A:
```javascript
// 提供
import { provide } from 'vue';
provide('key', value);

// 注入
import { inject } from 'vue';
const value = inject('key', defaultValue);
```

## 📖 参考资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Composition API FAQ](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
- [Vue 2 到 Vue 3 迁移指南](https://v3-migration.vuejs.org/)

## ✨ 迁移完成检查

完成迁移后，确保:
- [ ] 组件能够正常渲染
- [ ] 数据绑定工作正常
- [ ] 事件处理正常
- [ ] 样式显示正确
- [ ] 没有控制台错误或警告
- [ ] 性能没有明显下降

---

**迁移完成日期**: 2025-11-12
**迁移状态**: 核心架构完成 ✅ | 具体组件待迁移 🔄
