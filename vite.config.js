import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes the project to your local network
    proxy: {
      '/papi': {
        target: 'https://ondemand.st',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
