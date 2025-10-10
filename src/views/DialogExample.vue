<template>
  <div class="component-documentation">
    <h1>Dialog 弹窗</h1>
    <p>在当前页面打开一个浮层，承载相关操作。</p>

    <h2>代码演示</h2>

    <DemoCard
      title="基础用法"
      description="最基础的弹窗，点击按钮触发。"
    >
      <template #demo>
        <Button type="primary" @click="showDialog = true">打开弹窗</Button>
        <Dialog v-model:visible="showDialog" title="这是一个弹窗" @confirm="onConfirm" @cancel="onCancel">
          <p>欢迎使用 Leyton UI!</p>
          <p>这是一个 Dialog 组件的基础使用样例。</p>
        </Dialog>
      </template>
      <template #code>
        <highlightjs language="xml" :code="codeBasic" />
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
import { Button, Dialog } from '../../packages/leyton-ui/src/index';
import DemoCard from '../components/DemoCard.vue';
import ApiTable from '../components/ApiTable.vue';

const showDialog = ref(false);

const onConfirm = () => {
  alert('点击了确认！');
};

const onCancel = () => {
  console.log('Dialog canceled');
};

const codeBasic = ref(`...`); // Brevity

// API Data
const propsHeaders = ['属性', '说明', '类型', '默认值'];
const propsData = ref([
  { 属性: 'visible', 说明: '是否显示弹窗，支持 v-model', 类型: 'boolean', 默认值: 'false' },
  { 属性: 'title', 说明: '弹窗的标题', 类型: 'string', 默认值: '提示' },
]);

const eventsHeaders = ['事件名', '说明', '参数'];
const eventsData = ref([
  { 事件名: 'update:visible', 说明: 'visible 属性更新时触发', 参数: '(value: boolean)' },
  { 事件名: 'confirm', 说明: '点击确认按钮时触发', 参数: '-' },
  { 事件名: 'cancel', 说明: '点击取消或关闭时触发', 参数: '-' },
]);

const slotsHeaders = ['插槽名', '说明'];
const slotsData = ref([
  { 插槽名: 'default', 说明: '弹窗的主要内容' },
  { 插槽名: 'footer', 说明: '自定义弹窗的页脚' },
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
</style>
