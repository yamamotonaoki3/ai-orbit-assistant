import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const productionCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'none'",
  "frame-src 'none'",
  "form-action 'self'",
].join('; ');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'production-csp-meta',
      apply: 'build',
      // GitHub Pages cannot customize HTTP response headers, so enforce
      // a production-only CSP via an HTML meta tag instead.
      // The dev server needs its own HMR policy and is restricted to localhost.
      transformIndexHtml: () => [
        {
          tag: 'meta',
          attrs: {
            'http-equiv': 'Content-Security-Policy',
            content: productionCsp,
          },
          injectTo: 'head-prepend',
        },
      ],
    },
  ],
  // GitHub Pagesの /repo-name/ 配下でもアセットを相対パスで解決する
  base: './',
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
});
