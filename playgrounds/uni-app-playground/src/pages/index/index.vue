<template>
  <view class="container">
    <view class="header">
      <text class="title">CMS 组件迁移测试</text>
      <text class="subtitle">Vue2 → Vue3</text>
    </view>

    <view class="nav-list">
      <view class="nav-item" @tap="goPage('/pages/cms-test/index')">
        <view class="nav-icon">🎨</view>
        <view class="nav-content">
          <text class="nav-title">CMS Vue3</text>
          <text class="nav-desc">使用 mockData.json 测试</text>
        </view>
        <view class="nav-arrow">→</view>
      </view>

      <view class="nav-item" @tap="goPage('/pages/upload/index')">
        <view class="nav-icon">📃</view>
        <view class="nav-content">
          <text class="nav-title">request库</text>
          <text class="nav-desc">文件上传</text>
        </view>
        <view class="nav-arrow">→</view>
      </view>
    </view>

    <view class="info-card">
      <text class="info-title">迁移状态</text>
      <view class="status-item">
        <text class="status-label">✅ 核心架构完成</text>
      </view>
      <view class="status-item">
        <text class="status-label">✅ 基础组件完成</text>
      </view>
      <view class="status-item">
        <text class="status-label">🔄 具体组件待迁移</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const goPage = (path) => {
  uni.navigateTo({
    url: path,
  })
}


</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 40rpx;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
  padding: 40rpx 0;

  .title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #212529;
    margin-bottom: 16rpx;
  }

  .subtitle {
    display: block;
    font-size: 28rpx;
    color: #6c757d;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

  .nav-icon {
    font-size: 60rpx;
    margin-right: 30rpx;
  }

  .nav-content {
    flex: 1;

    .nav-title {
      display: block;
      font-size: 32rpx;
      font-weight: 600;
      color: #212529;
      margin-bottom: 8rpx;
    }

    .nav-desc {
      display: block;
      font-size: 24rpx;
      color: #6c757d;
    }
  }

  .nav-arrow {
    font-size: 40rpx;
    color: #6c757d;
  }
}

.info-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-top: 40rpx;

  .info-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 30rpx;
  }

  .status-item {
    margin-bottom: 16rpx;

    .status-label {
      font-size: 28rpx;
    }
  }
}
</style>
