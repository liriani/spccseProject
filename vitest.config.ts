import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

/*
 * Separate vitest config — keeps the Figma/build plugins out of the test runner.
 * Only @vitejs/plugin-react is needed for JSX transform.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: false, // keep explicit imports — easier to trace
    css: false,     // no CSS processing in tests
  },
})
