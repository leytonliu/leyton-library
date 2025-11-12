# Dialog 弹窗组件

一个用于显示模态对话框的基础组件。

## 基础使用

通过 `v-model:visible` 控制显示和隐藏。

```vue
<template>
  <button @click="showDialog = true">打开弹窗</button>
  <Dialog v-model:visible="showDialog" title="提示" @confirm="handleConfirm" @cancel="handleCancel">
    <p>这是一段信息</p>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue';
import { Dialog } from '@leyton/ui';

const showDialog = ref(false);

const handleConfirm = () => {
  console.log('点击了确认');
};

const handleCancel = () => {
  console.log('点击了取消');
};
</script>
```

## Props

| 属性      | 说明             | 类型      | 默认值  |
| --------- | ---------------- | --------- | ------- |
| `visible` | 是否显示弹窗     | `Boolean` | `false` |
| `title`   | 弹窗的标题       | `String`  | `'提示'`  |

## Events

| 事件名            | 说明                                       | 回调参数 |
| ----------------- | ------------------------------------------ | -------- |
| `update:visible`  | `visible` 属性更新时触发                   | `(value: boolean)` |
| `confirm`         | 点击确认按钮时触发                         | -        |
| `cancel`          | 点击取消按钮或关闭图标时触发               | -        |

## Slots

| 插槽名    | 说明               |
| --------- | ------------------ |
| `default` | 弹窗的主要内容     |
| `footer`  | 自定义弹窗的页脚内容 |

### 自定义页脚

```vue
<template>
  <Dialog v-model:visible="showDialog" title="自定义页脚">
    <p>内容</p>
    <template #footer>
      <button @click="showDialog = false">我知道了</button>
    </template>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue';
import { Dialog } from '@leyton/ui';

const showDialog = ref(false);
</script>
```
