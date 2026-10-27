import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // Template comments are always left out: a comment above a component's root element makes two roots, and a
  // page or step inside <Transition mode="out-in"> then never finishes leaving (the next page stays blank).
  // Without this the result depended on the build machine's NODE_ENV.
  plugins: [vue({ template: { compilerOptions: { comments: false } } })],
  server: {
    port: 5173,
    proxy: {
      // In dev, proxy API calls to local Express server
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})