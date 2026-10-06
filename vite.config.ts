import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
  },
  build: {
    chunkSizeWarningLimit: 1000 // Core simulation logic and React bundle often exceed 500kb
  }
});
