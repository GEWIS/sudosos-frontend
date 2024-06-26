import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import useGitInfo from "./vite.config.plugin-git-info";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
              @import "./src/scss/styles.scss";
            `
      }
    }
  },
  server: {
    port: 5174
  },
  define: {
    ...useGitInfo(),
  }
});
