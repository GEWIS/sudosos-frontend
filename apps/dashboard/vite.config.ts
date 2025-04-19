import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const PROXY_URL = 'https://sudosos.gewis.nl';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    base: './',
    plugins: [vue()],
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
          api: 'modern-compiler',
        },
      },
    },
    server: {
      port: 5173,
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
      },
    },
  };
});
