import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import os from 'os';
import path from 'path';

export default defineConfig({
  base: '/asme-tube-calculator/',
  cacheDir: path.join(os.tmpdir(), 'vite-asme-calculator'),
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
