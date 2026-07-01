import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 需要设置 base 路径
  base: '/luxe-fashion-store/',
  appType: 'spa',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    // 显式配置 SPA fallback,确保 /login /register 等路由直接访问不 404
    middlewareMode: false,
  },
})
