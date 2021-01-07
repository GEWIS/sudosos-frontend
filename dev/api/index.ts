export default {
  getCorrectFileName(baseURL: string, route: string) {
    // Product routes
    if (route.includes('product')) {
      if (route.includes('id')) {
        return `${baseURL}data/product.json`;
      }
    }

    return `${baseURL}data/error.json`;
  },
};
