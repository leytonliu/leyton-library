import { defineConfig } from 'vitest/config';
import path from 'path';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
  plugins: [
    uni(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    // 启用类似 Jest 的全局 API (describe, it, expect)
    globals: true,
    // 使用 jsdom 模拟浏览器环境
    environment: 'jsdom',
    // 测试前的环境准备（Mock uni 对象）
    setupFiles: ['./src/test/setup.ts'],
    // 包含的文件模式
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
