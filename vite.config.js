import basicSsl from '@vitejs/plugin-basic-ssl';
import { basename, resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';

const rootPages = [
  'index.html',
  'perm.html',
  'hub.html',
  'scan.html',
  'complete.html',
  'reflect.html',
  'engrave.html',
  'seal.html',
  'detail.html',
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appKey = env.VITE_8THWALL_APP_KEY?.trim() ?? '';

  const xrScript = appKey
    ? `<script async crossorigin="anonymous" src="https://apps.8thwall.com/xrweb?appKey=${encodeURIComponent(appKey)}"></script>`
    : `<script async crossorigin="anonymous" src="https://cdn.jsdelivr.net/npm/@8thwall/engine-binary@1/dist/xr.js" data-preload-chunks="slam"></script>`;

  const input = Object.fromEntries(rootPages.map((f) => [f.replace(/\./g, '_'), resolve(__dirname, f)]));

  return {
    base: './',
    plugins: [
      basicSsl(),
      {
        name: 'inject-8thwall-xr',
        transformIndexHtml(html, ctx) {
          const marker = '<!--8THWALL_XR-->';
          if (!html.includes(marker)) return html;
          return html.replace(marker, basename(ctx.filename) === 'scan.html' ? xrScript : '');
        },
      },
    ],
    build: {
      rollupOptions: { input },
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
