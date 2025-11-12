# Loading 加载组件

一个用于显示全局加载指示器的可编程组件，用法类似于 `uni.showLoading`。

## 如何使用

### 1. 在 `App.vue` 中引入组件并挂载到全局

`uni-app` 的机制需要在 `App.vue` 中进行设置，以便全局调用。

```vue
// App.vue
<template>
  <!-- 
    App.vue 的 template 在小程序端不会被渲染，
    但我们需要在这里放置组件的根元素，以便 Vue3 的 setup 能够正确初始化组件实例。
    这个组件实例将在 onLaunch 中被引用。
  -->
  <Loading ref="globalLoading" />
</template>

<script setup>
import { ref } from 'vue';
import { onLaunch } from '@dcloudio/uni-app';
import Loading from '@/packages/leyton-ui/src/components/loading'; // 请根据你的项目结构修改路径

const globalLoading = ref(null);

onLaunch(() => {
  // 将组件实例的方法挂载到 uni 全局对象上
  if (globalLoading.value) {
    uni.$loading = {
      show: globalLoading.value.show,
      hide: globalLoading.value.hide,
    };
  }
  console.log('App Launch');
});
</script>

<style>
  /* app.vue 中可以放置全局样式 */
</style>
```

**重要提示:**

1.  请确保 `@/packages/leyton-ui/src/components/loading` 的路径对于您的 `App.vue` 是正确的。
2.  `uni-app` 在编译到小程序时，`App.vue` 的 `<template>` 内容不会显示。但对于 Vue3 `setup` 语法，我们需要将 `<Loading ref="globalLoading" />` 放在 template 中，这样 `globalLoading` ref 才能在 `onLaunch` 时正确获取到组件实例。

### 2. 在页面或组件中调用

现在你可以在任何页面或组件中通过 `uni.$loading` 来控制加载状态。

```vue
<template>
  <view>
    <button @click="startLoading">开始加载</button>
  </view>
</template>

<script setup>
const startLoading = () => {
  // 显示 loading
  uni.$loading.show({
    title: '正在处理中...'
  });

  // 模拟一个异步操作
  setTimeout(() => {
    // 隐藏 loading
    uni.$loading.hide();
  }, 2000);
}
</script>
```

## API

### `uni.$loading.show(options)`

显示加载指示器。

- `options` (Object): 可选参数
  - `title` (String): 加载时显示的文本，默认为 '加载中...'。

### `uni.$loading.hide()`

隐藏加载指示器。