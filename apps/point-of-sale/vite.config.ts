import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

const PROXY_URL = 'https://sudosos.test.gewis.nl';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    base: './',
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['ToastService'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
              @import "./src/scss/styles.scss";
            `,
        },
      },
    },
    server: {
      port: 5174,
      proxy: {
        '/api/v1': {
          target: PROXY_URL + '/api/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/v1/, ''),
        },
        '/static': {
          target: PROXY_URL + '/static',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/static/, ''),
        },
        '/ws': {
          target: PROXY_URL + '/ws',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/ws/, ''),
        },
      },
    },
  };
});
