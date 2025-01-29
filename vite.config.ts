/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: './index.html',
        'service-worker': './src/service-worker/service-worker.ts',
      },
      output: {
        entryFileNames: ({ name }) => {
          return name === 'service-worker'
            ? 'service-worker.js'
            : '[name][hash].js';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test-utils': path.resolve(__dirname, './test/test-utils.tsx'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts', './test/mock-extension-apis.ts'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/types/*',
        'src/features/*',
        'src/main.tsx',
        'src/App.tsx',
        'src/app/*',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 85,
      },
    },
  },
});
