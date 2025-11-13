<template>
  <cms-preview
    v-if="!pageConfigLoading && !pageConfigEmpty"
    :data="pageConfig"
    :envConfig="envConfig"
  />
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import CmsPreview from './packages/cms-preview.vue';
import mockData from '../../mockData.json';
import { CmsPageConfig } from './cms';

const envConfig = ref({});
const pageConfig = ref<CmsPageConfig | undefined>();

const pageConfigLoading = ref(false);
const pageConfigEmpty = ref(true);

onMounted(async () => {
  try {
    console.log('加载 mockData:', mockData);
    pageConfigLoading.value = true;
    pageConfigEmpty.value = true;
    setTimeout(() => {
      // 直接使用 mockData
      pageConfig.value = mockData as CmsPageConfig;
      // 设置环境配置
      envConfig.value = {
        // 根据需要添加环境配置
        env: 'dev',
      };
      console.log('页面数据加载成功', pageConfig.value);

      pageConfigLoading.value = false;
      pageConfigEmpty.value = false;
    }, 200);
  } catch (e) {
    console.error('加载页面数据失败:', e);
  }
});
</script>
