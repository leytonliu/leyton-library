<template>
  <cms-preview
    v-if="hasValidData"
    :data="data"
    :envConfig="envConfig"
  />
  <view v-else class="cms-page-empty">
    <!-- 空状态提示 -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CmsPageConfig, CmsEnvConfig } from './cms.js';
import CmsPreview from './cms-preview.vue';

interface Props {
  data: CmsPageConfig;
  envConfig?: CmsEnvConfig;
}

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  envConfig: () => ({
    env: 'production',
  }),
});

defineOptions({
  name: 'CmsPage',
});

// 检查是否有有效的页面数据
const hasValidData = computed(() => {
  return props.data && props.data.childrenData && props.data.childrenData.length > 0;
});
</script>

<style scoped>
.cms-page-empty {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
