import { defineConfig } from 'vite'
const targetpath = 'http://localhost:5000'

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/auth': {
        target: targetpath,
        changeOrigin: true,
      },
      '/expenses': {
        target: targetpath,
        changeOrigin: true,
      },
      '/dashboard': {
        target: targetpath,
        changeOrigin: true,
      },
      '/chat': {
        target: targetpath,
        changeOrigin: true,
      },
    },
  },
})
