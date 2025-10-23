<template>
  <view v-if="visible" class="loading-overlay">
    <view class="loading-box">
      <view class="loading-spinner"></view>
      <text v-if="title" class="loading-text">{{ title }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const title = ref('加载中...');

const show = (options: { title?: string } = {}) => {
  title.value = options.title || '加载中...';
  visible.value = true;
};

const hide = () => {
  visible.value = false;
};

// 通过 defineExpose 暴露方法
defineExpose({
  show,
  hide,
});
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-box {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  min-height: 120px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #00b462;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 15px;
  color: #333;
  font-size: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>