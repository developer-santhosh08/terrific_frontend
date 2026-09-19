import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@phosphor-icons/react': fileURLToPath(new URL('./src/lib/phosphor-bootstrap-icons.jsx', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://terrificerp.ahattrickz.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    target: 'esnext', // Use modern JS syntax
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['react-select', 'framer-motion', 'styled-components']
        }
      }
    }
  }
})
