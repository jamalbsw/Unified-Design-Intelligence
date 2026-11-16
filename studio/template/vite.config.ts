import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Relative base so a build works from any preview path (for example /pr-12/).
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      // Adapter boundary: swap this target for the official Nightingale package once approved.
      '@studio/ui': fileURLToPath(new URL('./src/ui/index.ts', import.meta.url)),
    },
  },
})
