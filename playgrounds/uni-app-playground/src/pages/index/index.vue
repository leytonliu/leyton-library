<template>
  <view class="content">
    <image class="logo" src="/static/logo.png"></image>
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>
    <view class="button-area">
      <button type="primary" @click="startLoading">显示 Loading</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const title = ref('Hello Leyton');

const startLoading = () => {
  uni.$loading.show({
    title: '测试中...'
  });

  setTimeout(() => {
    uni.$loading.hide();
  }, 2000);
};
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}

.button-area {
  margin-top: 50rpx;
}
</style>
