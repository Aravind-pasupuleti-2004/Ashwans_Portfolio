import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    open: false,
    watch: {
      // QA browser profiles churn temp files here and crash the watcher (EBUSY)
      ignored: ['**/.qa/**', '**/qa/**'],
    },
  },
})
