import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pagesの /repo-name/ 配下でもアセットを相対パスで解決する
  base: './',
});