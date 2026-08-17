import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Monaco editor is ~480 KB; give it its own chunk so the
          // interactive track and map page load without pulling it in.
          if (id.includes('monaco-editor') || id.includes('@monaco-editor')) return 'monaco'
          // Pyodide workers are large and only needed for code challenges.
          if (id.includes('pyodide')) return 'pyodide'
          // Framer-motion is used everywhere but separate from vendor makes
          // cache busting cheaper.
          if (id.includes('framer-motion')) return 'framer'
          // Everything else from node_modules goes in vendor.
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
  base: process.env.DEPLOY_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['pyodide'],
  },
})
