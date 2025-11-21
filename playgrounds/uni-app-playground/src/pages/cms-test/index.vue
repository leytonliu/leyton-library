<template>
  <view class="cms-test-page">
    <!-- <view class="test-header">
      <text class="test-title">CMS Vue3 组件测试页面</text>
      <text class="test-subtitle">使用 mockData.json 测试</text>
    </view> -->

    <cms-page />
  </view>
</template>

<script setup>
import CmsPage from '@/components/cms/cms-page.vue';
</script>

<style lang="scss" scoped>
.cms-test-page {
  min-height: 100vh;
  background-color: #fff;
}

.test-header {
  padding: 40rpx 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;

  .test-title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
  }

  .test-subtitle {
    display: block;
    font-size: 24rpx;
    opacity: 0.9;
  }
}

.error-message {
  padding: 30rpx;
  margin: 30rpx;
  background-color: #fee;
  border: 2px solid #f00;
  border-radius: 10rpx;
  color: #c00;
}
</style>
