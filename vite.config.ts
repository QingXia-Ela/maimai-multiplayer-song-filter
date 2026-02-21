import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  base: './', // 设为相对路径以适应 GitHub Pages 部署
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'https://maimai.lxns.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
