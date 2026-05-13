import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appKey = env.VITE_8THWALL_APP_KEY?.trim() ?? '';

  const xrScript = appKey
    ? `<script async crossorigin="anonymous" src="https://apps.8thwall.com/xrweb?appKey=${encodeURIComponent(appKey)}"></script>`
    : `<script async crossorigin="anonymous" src="https://cdn.jsdelivr.net/npm/@8thwall/engine-binary@1/dist/xr.js" data-preload-chunks="slam"></script>`;

  return {
    // 하위 경로 호스팅에서 /assets 404 방지
    base: './',
    plugins: [
      basicSsl(),
      {
        name: 'inject-8thwall-xr',
        transformIndexHtml(html) {
          const marker = '<!--8THWALL_XR-->';
          if (!html.includes(marker)) return html;
          return html.replace(marker, xrScript);
        },
      },
    ],
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
  };
});
