import { defineConfig } from 'vite'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const targetpath = env.VITE_BACKEND_URL || 'http://localhost:5000'

  return {
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
  }
})
