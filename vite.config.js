import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  // ZapWorks 등 하위 경로 호스팅에서 /assets, /targets 404 방지
  base: './',
  plugins: [basicSsl()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        detail: resolve(__dirname, 'detail.html'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    https: true,
  },
  preview: {
    host: '0.0.0.0',
    https: true,
  },
});
