<template>
  <view>AI</view>
</template>

<script lang="ts" setup>
import { z } from 'zod';

// 1. 定义 Schema (既是逻辑，也是类型)
const UserSchema = z.object({
  name: z.string(),
  age: z.number().min(0).max(120), // 甚至可以限制范围
  email: z.string().email().optional(), // 甚至可以验证格式
});

console.log('UserSchema', UserSchema);

// 2. 校验数据
const result = UserSchema.safeParse({
  name: '22',
  age: 11,
  email: '8951@qq.com',
});

if (result.success) {
  // result.data 就是绝对安全的 User 类型
  console.log(result.data.age);
} else {
  // 校验失败，Zod 会告诉你具体哪个字段错了
  console.error(result.error);
}
</script>
