import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LeytonCms',
      fileName: 'index',
    },
    rollupOptions: {
      // 将 Vue 和 uni-app 作为外部依赖
      external: ['vue', '@dcloudio/uni-app'],
      output: {
        globals: {
          vue: 'Vue',
          '@dcloudio/uni-app': 'uni',
        },
      },
    },
  },
});
