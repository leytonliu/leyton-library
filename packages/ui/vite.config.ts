import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    cssCodeSplit: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LeytonUI',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['vue', '@leyton/tools'],
      output: {
        globals: {
          'vue': 'Vue',
          '@leyton/tools': 'LeytonTools'
        }
      }
    }
  }
})
