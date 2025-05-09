import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd());
  const proxyTarget = env.VITE_API_TARGET || '';

  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false, // disable certificate verification for dev
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.mjs',
    },
    resolve: {
      alias: {
        '@assets': '/src/assets',
        '@components': '/src/components',
      },
    },
    build: {
      outDir: path.resolve(__dirname, '../dist'), // Set output directory to parent directory
      emptyOutDir: true, // Clear output directory before building
    },
    optimizeDeps: {
      exclude: ['@headlessui/react', '@heroicons/react'],
    },
    css: {
      postcss: './postcss.config.js',
    },
  };
});