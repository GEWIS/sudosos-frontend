/* eslint-disable max-len */

import { BasePointOfSale, PointOfSale } from '@/entities/PointOfSale';
import UserTransformer from '@/transformers/UserTransformer';
import ContainerTransformer from '@/transformers/ContainerTransformer';
import ProductTransformer from '@/transformers/ProductTransformer';
import BaseTransformer from '@/transformers/BaseTransformer';

export default {
  makePointOfSale(data: any): BasePointOfSale | PointOfSale {
    if (!Object.keys(data).includes('owner')) {
      return {
        ...BaseTransformer.makeBaseEntity(data),
        name: data.name,
      } as BasePointOfSale;
    }

    return {
      ...BaseTransformer.makeBaseEntity(data),
      name: data.name,
      revision: data.revision,
      owner: UserTransformer.makeUser(data.owner),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      containers: data.containers.map((container: any) => ContainerTransformer.makeContainer(container)),
      productOrder: data.productOrder.map((order: any) => ProductTransformer.makeProductOrder(order)),
      useAuthentication: data.useAuthentication,
    } as PointOfSale;
  },
};
