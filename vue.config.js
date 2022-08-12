module.exports = {
  css: {
    loaderOptions: {
      scss: {
        additionalData: '@import "~@/styles/global/_variables.scss";',
      },
    },
  },
  devServer: {
    proxy: {
      '^/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '^/static': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
};
