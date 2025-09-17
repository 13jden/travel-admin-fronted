import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    global: 'window',
  },
  server: {
    port: 5174,
    host: '0.0.0.0',  
    proxy: {
      '/api': {
        target: 'http://121.199.34.64:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: 'http://121.199.34.64:8081',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
