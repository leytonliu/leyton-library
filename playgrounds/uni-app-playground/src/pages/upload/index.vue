<template>
  <view class="request-test-page">
    <text class="title">请求测试页面</text>

    <view class="section">
      <text class="section-title">普通 GET 请求测试</text>
      <input class="input" v-model="testUrl" placeholder="输入 GET 请求URL (默认/test-get)"/>
      <button @click="testNormalRequest">发送 GET 请求</button>
      <text v-if="normalRequestResult">GET 结果: {{ normalRequestResult }}</text>
      <text v-if="normalRequestError" class="error-text">GET 失败: {{ normalRequestError }}</text>
    </view>

    <view class="section">
      <text class="section-title">普通 POST 请求测试</text>
      <input class="input" v-model="postUrl" placeholder="输入 POST 请求URL (默认/test-post)"/>
      <input class="input" v-model="postBody" placeholder="输入 POST 请求Body (JSON格式)"/>
      <button @click="testPostRequest">发送 POST 请求</button>
      <text v-if="postRequestResult">POST 结果: {{ postRequestResult }}</text>
      <text v-if="postRequestError" class="error-text">POST 失败: {{ postRequestError }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HttpClient from '@leyton/request';

// 初始化 HttpClient 实例
const client = new HttpClient({
  baseURL: 'https://echo.apifox.com', // 请替换为你的后端服务地址
  onError: (err) => {
    console.error('HttpClient Global Error:', err);
    uni.showToast({title: `请求错误: ${err.message}`, icon: 'none'});
  },
});

const testUrl = ref('/get');
const normalRequestResult = ref('');
const normalRequestError = ref('');

const postUrl = ref('/post');
const postBody = ref(JSON.stringify({name: 'test', value: 123}));
const postRequestResult = ref('');
const postRequestError = ref('');

const testNormalRequest = async () => {
  normalRequestResult.value = '';
  normalRequestError.value = '';
  try {
    const data = await client.get<{ message: string; timestamp?: string; randomValue?: number }>(testUrl.value);
    normalRequestResult.value = JSON.stringify(data, null, 2);
    uni.showToast({title: 'GET 请求成功', icon: 'success'});
  } catch (error: any) {
    console.error('GET 请求失败:', error);
    normalRequestError.value = error.message || '未知错误';
    uni.showToast({title: `GET 请求失败: ${normalRequestError.value}`, icon: 'error'});
  }
};

const testPostRequest = async () => {
  postRequestResult.value = '';
  postRequestError.value = '';
  try {
    const data = await client.post<{ message: string; receivedData?: any }>(postUrl.value, JSON.parse(postBody.value));
    postRequestResult.value = JSON.stringify(data, null, 2);
    uni.showToast({title: 'POST 请求成功', icon: 'success'});
  } catch (error: any) {
    console.error('POST 请求失败:', error);
    postRequestError.value = error.message || '未知错误';
    uni.showToast({title: `POST 请求失败: ${postRequestError.value}`, icon: 'error'});
  }
};
</script>

<style scoped>
.request-test-page {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
  text-align: center;
}

.section {
  margin-bottom: 40rpx;
  padding: 20rpx;
  border: 1px solid #eee;
  border-radius: 8rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

button {
  margin-bottom: 20rpx;
  background-color: #007aff;
  color: #fff;
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  text-align: center;
}

text {
  display: block;
  margin-bottom: 10rpx;
  font-size: 28rpx;
}

.input {
  border: 1px solid #ccc;
  padding: 10rpx;
  margin-bottom: 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.error-text {
  color: red;
  font-size: 28rpx;
}
</style>
