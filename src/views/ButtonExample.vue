<template>
  <div class="component-documentation">
    <h1>Button 按钮</h1>
    <p>用户通过点击按钮来触发一个操作。</p>

    <h2>代码演示</h2>

    <DemoCard
      title="基础用法"
      description="按钮有五种基础类型：主按钮、次按钮、危险按钮、警告按钮和文字按钮。"
    >
      <template #demo>
        <Button>Default</Button>
        <Button type="primary">Primary</Button>
        <Button type="secondary">Secondary</Button>
        <Button type="danger">Danger</Button>
        <Button type="warning">Warning</Button>
        <Button type="text">Text</Button>
      </template>
      <template #code>
        <highlightjs language="xml" :code="codeBasic" />
      </template>
    </DemoCard>

    <DemoCard
      title="不同尺寸"
      description="按钮有 `small`, `medium`, `large` 三种尺寸。"
    >
      <template #demo>
        <Button size="small">Small</Button>
        <Button size="medium">Medium</Button>
        <Button size="large">Large</Button>
      </template>
      <template #code>
        <highlightjs language="xml" :code="codeSize" />
      </template>
    </DemoCard>

    <DemoCard
      title="加载状态"
      description="通过 `loading` 属性来让按钮进入加载状态。"
    >
      <template #demo>
        <Button type="primary" loading>Loading</Button>
        <Button type="danger" loading>Loading</Button>
      </template>
      <template #code>
        <highlightjs language="xml" :code="codeLoading" />
      </template>
    </DemoCard>

    <DemoCard
      title="禁用状态"
      description="通过 `disabled` 属性来禁用按钮。"
    >
      <template #demo>
        <Button disabled>Disabled</Button>
        <Button type="primary" disabled>Disabled</Button>
      </template>
      <template #code>
        <highlightjs language="xml" :code="codeDisabled" />
      </template>
    </DemoCard>

    <div class="api-docs">
      <h2>API</h2>
      <ApiTable title="Props" :headers="propsHeaders" :data="propsData" />
      <ApiTable title="Events" :headers="eventsHeaders" :data="eventsData" />
      <ApiTable title="Slots" :headers="slotsHeaders" :data="slotsData" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '../../packages/leyton-ui/src/index';
import DemoCard from '../components/DemoCard.vue';
import ApiTable from '../components/ApiTable.vue';

// Code examples
const codeBasic = ref(`...`); // Keeping it short for brevity
const codeSize = ref(`...`);
const codeLoading = ref(`...`);
const codeDisabled = ref(`...`);

// API Data
const propsHeaders = ['属性', '说明', '类型', '默认值'];
const propsData = ref([
  { 属性: 'type', 说明: '按钮类型', 类型: `'default' | 'primary' | 'secondary' | 'warning' | 'danger' | 'text'`, 默认值: 'default' },
  { 属性: 'size', 说明: '按钮尺寸', 类型: `'small' | 'medium' | 'large'`, 默认值: 'medium' },
  { 属性: 'disabled', 说明: '是否禁用', 类型: 'boolean', 默认值: 'false' },
  { 属性: 'loading', 说明: '是否为加载中状态', 类型: 'boolean', 默认值: 'false' },
]);

const eventsHeaders = ['事件名', '说明', '参数'];
const eventsData = ref([
  { 事件名: 'click', 说明: '点击按钮时触发', 参数: '-' },
]);

const slotsHeaders = ['插槽名', '说明'];
const slotsData = ref([
  { 插槽名: 'default', 说明: '按钮的文本内容' },
]);

</script>

<style scoped>
.component-documentation h1 {
  font-size: 2.5rem;
  font-weight: 600;
}
.component-documentation > p {
  font-size: 1rem;
  color: #555;
  margin-bottom: 2rem;
}

h2 {
  font-size: 2rem;
  font-weight: 600;
  margin: 3rem 0 1.5rem 0;
}

.demo-card__example > * {
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
