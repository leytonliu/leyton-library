<template>
  <cms-preview :data="pageData" :envConfig="envConfig" />
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import CmsPreview from './packages/cms-preview.vue';
import mockData from '../../mockData.json';
import { CmsPageConfig } from './cms';

console.log('mockData', mockData);

const pageData = ref<CmsPageConfig | undefined>();
const envConfig = ref({});

onMounted(async () => {
  try {
    console.log('加载 mockData:', mockData);

    // 直接使用 mockData
    pageData.value = mockData as CmsPageConfig;

    // 设置环境配置
    envConfig.value = {
      // 根据需要添加环境配置
      env: 'dev',
    };

    console.log('页面数据加载成功', pageData.value);
  } catch (e) {
    console.error('加载页面数据失败:', e);
  }
});
</script>
