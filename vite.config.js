import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { cpSync, createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { basename, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const XR_ENGINE_SRC = resolve(__dirname, 'node_modules/@8thwall/engine-binary/dist');

/** CDN 대신 동일 출처로 xr.js·xr-slam·resources 제공 (차단/COEP 이슈 대안). */
function xrEngineSelfHostPlugin() {
  const mimeByExt = {
    js: 'application/javascript; charset=utf-8',
    wasm: 'application/wasm',
    json: 'application/json',
    svg: 'image/svg+xml',
    glb: 'model/gltf-binary',
    tflite: 'application/octet-stream',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    woff2: 'font/woff2',
  };

  function serveXrEngine(req, res, next) {
    if (req.method !== 'GET') return next();
    const raw = req.url?.split('?')[0] ?? '';
    if (!raw.startsWith('/xr-engine/')) return next();
    const rel = decodeURIComponent(raw.slice('/xr-engine/'.length));
    if (!rel || rel.includes('..')) {
      res.statusCode = 400;
      res.end();
      return;
    }
    const file = resolve(XR_ENGINE_SRC, rel);
    const relToSrc = relative(XR_ENGINE_SRC, file);
    if (relToSrc.startsWith('..') || relToSrc.includes('..')) {
      res.statusCode = 403;
      res.end();
      return;
    }
    if (!existsSync(file) || !statSync(file).isFile()) {
      res.statusCode = 404;
      res.end();
      return;
    }
    const ext = rel.split('.').pop()?.toLowerCase() ?? '';
    res.setHeader('Content-Type', mimeByExt[ext] ?? 'application/octet-stream');
    createReadStream(file).on('error', next).pipe(res);
  }

  return {
    name: 'xr-engine-self-host',
    configureServer(server) {
      server.middlewares.use(serveXrEngine);
    },
    closeBundle() {
      const out = resolve(__dirname, 'dist/xr-engine');
      mkdirSync(out, { recursive: true });
      cpSync(XR_ENGINE_SRC, out, { recursive: true });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appKey = env.VITE_8THWALL_APP_KEY?.trim() ?? '';

  const xrScript = appKey
    ? `<script async crossorigin="anonymous" src="https://apps.8thwall.com/xrweb?appKey=${encodeURIComponent(appKey)}"></script>`
    : `<script async crossorigin="anonymous" src="./xr-engine/xr.js" data-preload-chunks="slam"></script>`;

  return {
    base: './',
    plugins: [
      basicSsl(),
      react(),
      xrEngineSelfHostPlugin(),
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
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          scan: resolve(__dirname, 'scan.html'),
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
