import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget =
    env.VITE_BACKEND_TARGET ||
    'https://asemanyar-backend.onrender.com'

  return {
    plugins: [react()],
    envPrefix: ["VITE_", "REACT_APP_"],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) =>
            path.startsWith('/api/v1') ? path : path.replace(/^\/api/, '/api/v1'),
        },
        '/health': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
