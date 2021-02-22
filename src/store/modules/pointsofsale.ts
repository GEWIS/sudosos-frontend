/* eslint-disable max-len */

import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import APIHelper from '@/mixins/APIHelper';
import { PointOfSale } from '@/entities/PointOfSale';
import PointOfSaleTransformer from '@/transformers/PointOfSaleTransformer';

@Module({ dynamic: true, store, name: 'PointOfSaleModule' })
export default class PointOfSaleModule extends VuexModule {
  pointsOfSale: PointOfSale[] = [];

  @Mutation
  setPointsOfSale(pointsOfSale: PointOfSale[]) {
    this.pointsOfSale = pointsOfSale;
  }

  @Mutation
  addPointOfSale(pointOfSale: PointOfSale) {
    let pointOfSaleResponse = APIHelper.postResource('pointOfSale', pointOfSale);
    pointOfSaleResponse = PointOfSaleTransformer.makePointOfSale(pointOfSaleResponse);
    this.pointsOfSale.push(pointOfSaleResponse as PointOfSale);
  }

  @Mutation
  removePointOfSale(pointOfSale: PointOfSale) {
    APIHelper.delResource('pointOfSale', pointOfSale);
    const index = this.pointsOfSale.findIndex(pos => pos.id === pointOfSale.id);
    this.pointsOfSale.splice(index, 1);
  }

  @Mutation
  updatePointOfSale(pointOfSale: PointOfSale) {
    const response = APIHelper.putResource('pointOfSale', pointOfSale);
    const pointOfSaleResponse = PointOfSaleTransformer.makePointOfSale(response);
    const index = this.pointsOfSale.findIndex(pos => pos.id === pointOfSaleResponse.id);
    this.pointsOfSale[index] = pointOfSaleResponse as PointOfSale;
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchPointsOfSale(force: boolean = false) {
    if (this.pointsOfSale.length === 0 || force) {
      const pointsOfSaleResponse = APIHelper.getResource('pointOfSale') as [];
      const posResponse = pointsOfSaleResponse.map(pos => PointOfSaleTransformer.makePointOfSale(pos));
      this.context.commit('setPointsOfSale', posResponse);
    }
  }
}
