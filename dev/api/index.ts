/* eslint-disable */

import { ResponseBody } from '@/entities/ResponseBody';
import Products from './data/products.json';
import UserProducts from './data/userproducts.json';
import User from './data/user.json';
import Saldo from './data/saldo.json';
import Banners from './data/banners.json';
import Containers from './data/containers.json';
import PublicContainers from './data/publiccontainers.json';
import Transactions from './data/transactions.json';
import PointsOfSale from './data/pos.json';
import SocialDrinkCards from './data/socialdrinkcards.json';
import FlaggedTransactions from './data/flaggedtransactions.json';
import Transfer from './data/transfer.json';
import ProductCategories from './data/productcategories.json';

function setResponse(body: ResponseBody, route: string, type: any, typeName?: string) {
  const params = new URLSearchParams(route.split('?')[1]);

  if (body.method === 'POST') {
    const response = JSON.parse(body.body || '');
    response.id = Number(Math.random() * 1000000).toFixed();
    response.createdAt = new Date();
    response.updatedAt = response.createdAt;

    if (typeName === 'borrelkaart') {
      response.borrelkaarten = [];
      for (let i = 0; i < response.amount; i++) {
        const id = Number(Math.random() * 10000000000).toFixed();

        const kaart = {
          id,
          ean: id,
          name: String(id),
          saldo: response.initialValue,
          type: 3,
          active: false,
        };

        response.borrelkaarten.push(kaart);
      }
    }

    if (typeName === 'flaggedtransaction') {
      response.status = 1;
      response.flaggedBy = {
        id: 0,
        name: 'Ruben Brinkman',
      };
    }

    if (typeName === 'containers') {
      response.owner = {
        id: 0,
        name: 'Ruben Brinkman',
      };
      response.products = [];
    }

    return response;
  }

  if (body.method === 'PUT' || body.method === 'PATCH') {
    const response = JSON.parse(body.body || '');
    response.updatedAt = new Date();

    if (typeName === 'products') {
      response.updatePending = true;
    }

    return response;
  }

  if (route.includes('id')) {
    const id = Number(params.get('id'));

    if (typeName === 'transactionPos') {
      return type.filter((trans: { pointOfSale: { id: number; }; }) => trans.pointOfSale.id === id);
    }
    return type.filter((response: { id: number; }) => response.id === id);
  }

  return type;
}


export default {
  fetchJSON(route: string, body: ResponseBody) {
    // eslint-disable-next-line no-param-reassign
    route = route.toLowerCase();

    if (route.includes('nfcdevice')) {
      return setResponse(body, route, User);
    }

    if (route.includes('userproducts')) {
      return setResponse(body, route, UserProducts);
    }

    if (route.includes('productcategories')) {
      return setResponse(body, route, ProductCategories);
    }

    if (route.includes('product')) {
      return setResponse(body, route, Products, 'products');
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

    if (route.includes('publiccontainer')) {
      return setResponse(body, route, PublicContainers);
    }

    if (route.includes('containers')) {
      return setResponse(body, route, Containers, 'containers');
    }

    if (route.includes('pointofsale')) {
      return setResponse(body, route, PointsOfSale);
    }

    if (route.includes('transactions')) {
      return setResponse(body, route, Transactions);
    }

    if (route.includes('borrelkaartgroup')) {
      return setResponse(body, route, SocialDrinkCards, 'borrelkaart');
    }

    if (route.includes('flagged')) {
      return setResponse(body, route, FlaggedTransactions, 'flaggedtransaction');
    }

    if (route.includes('transfer')) {
      return setResponse(body, route, Transfer);
    }

    if (route.includes('transactionpos')) {
      return setResponse(body, route, Transactions, 'transactionPos');
    }

    // Because typescript cannot handle throwing the way I want it.
    throw String(`${route} is not specified in devAPI fetchJSON`);
  },
};
