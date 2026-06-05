import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/shared/components'),
      '@/ui': path.resolve(__dirname, './src/shared/components/ui'),
      '@/layouts': path.resolve(__dirname, './src/shared/components/layout'),
      '@/hooks': path.resolve(__dirname, './src/shared/hooks'),
      '@/utils': path.resolve(__dirname, './src/shared/utils'),
      '@/types': path.resolve(__dirname, './src/shared/types'),
      '@/constants': path.resolve(__dirname, './src/shared/constants'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/styles': path.resolve(__dirname, './src/shared/styles'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/context': path.resolve(__dirname, './src/context'),
      '@/app': path.resolve(__dirname, './src/app'),
    },
  },
});
