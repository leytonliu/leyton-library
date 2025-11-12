# Leyton UI

这是一个基于 Vue 3 和 Element-Plus 的 UI 组件库。

## 如何使用

首先，你需要安装 `leyton-ui`：

```bash
npm install @leyton/ui
```

然后，你可以在你的代码中导入和使用组件：

```vue
<template>
  <Button type="primary">Primary Button</Button>
</template>

<script setup lang="ts">
import { Button } from '@leyton/ui';
</script>
```

## 如何导入样式

要导入组件的样式，你需要在你的主入口文件中导入 `@leyton/ui/style`：

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import '@leyton/ui/style';

createApp(App).mount('#app');
```

## 注意事项

目前，`vue-tsc` 在构建过程中存在一些问题，导致无法正常检查类型。为了解决这个问题，我们暂时在 `build` 脚本中移除了 `vue-tsc`。我们建议你在开发过程中依赖 IDE 的类型检查功能。
