import Products from './data/products.json';
import { ResponseBody } from '@/entities/ResponseBody';
import User from './data/user.json';
import Saldo from './data/saldo.json';
import Banners from './data/banners.json';

function setResponse(body: ResponseBody, route: string, type: any) {
  const params = new URLSearchParams(route);

  if (body.method === 'POST') {
    const response = JSON.parse(body.body || '');
    response.id = Number(Math.random() * 10000).toFixed();

    return response;
  }

  if (body.method === 'PUT' || body.method === 'PATCH') {
    return JSON.parse(body.body || '');
  }

  if (route.includes('id')) {
    return type.find((response: { id: number; }) => response.id === Number(params.get('id')));
  }

  return type;
}


export default {
  fetchJSON(route: string, body: ResponseBody) {
    // Route params
    const params = new URLSearchParams(route);

    if (route.includes('product')) {
      return setResponse(body, route, Products);
    }

    if (route.includes('user')) {
      return User;
    }

    if (route.includes('saldo')) {
      return Saldo;
    }

    if (route.includes('banners')) {
      return setResponse(body, route, Banners);
    }

    // Because typescript cannot handle throwing the way I want it.
    throw String(`${route} is not specified in devAPI fetchJSON`);
  },
};
