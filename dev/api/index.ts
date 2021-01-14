import Products from './data/products.json';

export default {
  fetchJSON(route: string) {
    // Route params
    const params = new URLSearchParams(route);

    if (route.includes('product')) {
      if (route.includes('id')) {
        return {
          data: Products.find(prd => prd.id === Number(params.get('id'))),
        };
      }

      return Products;
    }

    // Because typescript cannot handle throwing the way I want it.
    throw String(`${route} is not specified in devAPI fetchJSON`);
  },
};
