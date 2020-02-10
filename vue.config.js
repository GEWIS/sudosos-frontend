module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: '@import "~@/styles/global/_variables.scss";',
      },
    },
  },
};
