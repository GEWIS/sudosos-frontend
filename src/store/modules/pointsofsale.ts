import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import APIHelper from '@/mixins/APIHelper';
import { PointOfSale } from '@/entities/PointOfSale';
import PointOfSaleTransformer from '@/transformers/PointOfSaleTransformer';

@Module({ namespaced: true, name: 'pointofsale' })
export default class PointOfSaleModule extends VuexModule {
  pointsOfSale: PointOfSale[] = [];

  get getPointsOfSale() {
    if (this.pointsOfSale.length === 0) {
      this.fetchPointsOfSale();
    }
    return this.pointsOfSale;
  }

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

  @Action
  fetchPointsOfSale() {
    const pointsOfSaleResponse = APIHelper.getResource('pointOfSale') as [];
    pointsOfSaleResponse.map(pos => PointOfSaleTransformer.makePointOfSale(pos));
    this.context.commit('setPointsOfSale', pointsOfSaleResponse);
  }
}
