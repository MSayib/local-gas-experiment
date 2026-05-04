import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

export default defineConfig({
  root: 'src/client',
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/client'),
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@application': path.resolve(__dirname, 'src/application'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: false,
  },
});
