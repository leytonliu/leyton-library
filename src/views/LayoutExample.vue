<template>
  <div class="component-documentation">
    <h1>Layout 布局</h1>
    <p>用于页面整体布局的容器组件。</p>

    <DemoCard
      title="基础布局"
      description="典型的上中下布局。"
    >
      <template #demo>
        <Layout style="min-height: auto; text-align: center;">
          <LayoutHeader style="background: #7dbcea;">Header</LayoutHeader>
          <LayoutContent style="background: rgba(16, 142, 233, 1); color: #fff;">Content</LayoutContent>
          <LayoutFooter style="background: #7dbcea;">Footer</LayoutFooter>
        </Layout>
      </template>
      <template #code>
        <highlightjs language="xml" :code="codeBasic" />
      </template>
    </DemoCard>

    <DemoCard
      title="包含侧边栏的布局"
      description="典型的后台管理页面布局。"
    >
      <template #demo>
        <Layout style="min-height: auto; text-align: center;">
          <LayoutHeader style="background: #7dbcea;">Header</LayoutHeader>
          <Layout>
            <LayoutSider style="background: #3ba0e9;">Sider</LayoutSider>
            <LayoutContent style="background: rgba(16, 142, 233, 1); color: #fff;">Content</LayoutContent>
          </Layout>
          <LayoutFooter style="background: #7dbcea;">Footer</LayoutFooter>
        </Layout>
      </template>
      <template #code>
        <highlightjs language="xml" :code="codeWithSider" />
      </template>
    </DemoCard>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Layout, LayoutHeader, LayoutSider, LayoutContent, LayoutFooter } from '../../packages/leyton-ui/src/index';
import DemoCard from '../components/DemoCard.vue';

const codeBasic = ref(`
<Layout>
  <LayoutHeader>Header</LayoutHeader>
  <LayoutContent>Content</LayoutContent>
  <LayoutFooter>Footer</LayoutFooter>
</Layout>
`);

const codeWithSider = ref(`
<Layout>
  <LayoutHeader>Header</LayoutHeader>
  <Layout>
    <LayoutSider>Sider</LayoutSider>
    <LayoutContent>Content</LayoutContent>
  </Layout>
  <LayoutFooter>Footer</LayoutFooter>
</Layout>
`);

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
</style>
