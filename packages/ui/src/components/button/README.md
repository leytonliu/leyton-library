# Button 按钮组件

用于触发操作的基础按钮组件。

## 基础使用

```vue
<template>
  <Button>默认按钮</Button>
  <Button type="primary">主要按钮</Button>
  <Button type="danger">危险按钮</Button>
  <Button type="text">文字按钮</Button>
</template>

<script setup>
import { Button } from '@leyton/ui';
</script>
```

## 尺寸

支持 `small`, `medium`, `large` 三种尺寸。

```vue
<template>
  <Button size="small">小按钮</Button>
  <Button size="medium">中按钮</Button>
  <Button size="large">大按钮</Button>
</template>
```

## 加载状态

```vue
<template>
  <Button type="primary" loading>加载中</Button>
</template>
```

## 禁用状态

```vue
<template>
  <Button disabled>禁用按钮</Button>
</template>
```

## Props

| 属性       | 说明                                           | 类型      | 默认值    |
| ---------- | ---------------------------------------------- | --------- | --------- |
| `type`     | 按钮类型 (`default`, `primary`, `secondary`, `warning`, `danger`, `text`) | `String`  | `'default'` |
| `size`     | 按钮尺寸 (`small`, `medium`, `large`)          | `String`  | `'medium'`  |
| `disabled` | 是否禁用                                       | `Boolean` | `false`   |
| `loading`  | 是否为加载中状态                               | `Boolean` | `false`   |

## Events

该组件会透传所有原生事件，如 `@click`。

## Slots

| 插槽名    | 说明         |
| --------- | ------------ |
| `default` | 按钮的文本内容 |
