import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import APIHelper from '@/mixins/APIHelper';
import { PointOfSale } from '@/entities/PointOfSale';
import PointOfSaleTransformer from '@/transformers/PointOfSaleTransformer';

@Module({
  dynamic: true, namespaced: true, store, name: 'PointOfSaleModule',
})
export default class PointOfSaleModule extends VuexModule {
  pointsOfSale: PointOfSale[] = [];

  requestedPointsOfSale: PointOfSale[] = [];

  userPointsOfSale: PointOfSale[] = [];

  userRequestedPointsOfSale: PointOfSale[] = [];

  @Mutation
  reset() {
    this.pointsOfSale = [];
    this.requestedPointsOfSale = [];
    this.userPointsOfSale = [];
    this.userRequestedPointsOfSale = [];
  }

  @Mutation
  setPointsOfSale(pointsOfSale: PointOfSale[]) {
    this.pointsOfSale = pointsOfSale;
  }

  @Mutation
  setRequestedPointsOfSale(pointsOfSale: PointOfSale[]) {
    this.requestedPointsOfSale = pointsOfSale;
  }

  @Mutation
  setUserPointsOfSale(pointsOfSale: PointOfSale[]) {
    this.userPointsOfSale = pointsOfSale;
  }

  @Mutation
  setUserRequestedPointsOfSale(pointsOfSale: PointOfSale[]) {
    this.userRequestedPointsOfSale = pointsOfSale;
  }

  @Mutation
  addPointOfSale(pointOfSale: PointOfSale) {
    this.userPointsOfSale.push(pointOfSale as PointOfSale);

    // If this user also accessed general points of sale the newly added POS
    // should also be added there.
    if (this.pointsOfSale.length > 0) {
      this.pointsOfSale.push(pointOfSale as PointOfSale);
    }
  }

  @Mutation
  addRequestedPointOfSale(pointOfSale: PointOfSale) {
    this.userRequestedPointsOfSale.push(pointOfSale as PointOfSale);

    // If this user also accessed general points of sale the newly added POS
    // should also be added there.
    if (this.requestedPointsOfSale.length > 0) {
      this.requestedPointsOfSale.push(pointOfSale as PointOfSale);
    }
  }

  @Mutation
  removeRequestedPointOfSale(pointOfSale: PointOfSale) {
    let index = this.requestedPointsOfSale.findIndex((pos) => pos.id === pointOfSale.id);
    if (index >= 0) {
      this.requestedPointsOfSale.splice(index, 1);
    }

    index = this.userRequestedPointsOfSale.findIndex((pos) => pos.id === pointOfSale.id);
    if (index >= 0) {
      this.userRequestedPointsOfSale.splice(index, 1);
    }

    this.context.commit('addPointOfSale', pointOfSale);
  }

  @Mutation
  updatePointOfSale(pointOfSale: PointOfSale) {
    let index = this.pointsOfSale.findIndex((pos) => pos.id === pointOfSale.id);
    if (index >= 0) {
      this.pointsOfSale.splice(index, 1, pointOfSale);
    }

    index = this.userPointsOfSale.findIndex((pos) => pos.id === pointOfSale.id);
    if (index >= 0) {
      this.userPointsOfSale.splice(index, 1, pointOfSale);
    }
  }

  @Mutation
  updateRequestedPointOfSale(pointOfSale: PointOfSale) {
    let index = this.requestedPointsOfSale.findIndex((pos) => pos.id === pointOfSale.id);
    if (index >= 0) {
      this.requestedPointsOfSale.splice(index, 1, pointOfSale);
    }

    index = this.userRequestedPointsOfSale.findIndex((pos) => pos.id === pointOfSale.id);
    if (index >= 0) {
      this.userRequestedPointsOfSale.splice(index, 1, pointOfSale);
    }
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchPointsOfSale(force: boolean = false) {
    if (this.pointsOfSale.length === 0 || force) {
      APIHelper.getResource('pointsofsale').then((posResponse) => {
        const pointsOfSale = posResponse.map(
          (pos: any) => PointOfSaleTransformer.makePointOfSale(pos),
        );

        this.context.commit('setPointsOfSale', pointsOfSale);
      });
    }
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchRequestedPointsOfSale(force: boolean = false) {
    if (this.requestedPointsOfSale.length === 0 || force) {
      APIHelper.getResource('pointsofsale/updated').then((posResponse) => {
        const pointsOfSale = posResponse.map(
          (pos: any) => PointOfSaleTransformer.makePointOfSale(pos),
        );

        this.context.commit('setRequestedPointsOfSale', pointsOfSale);
      });
    }
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchUserPointsOfSale(id: number, force: boolean = false) {
    if (this.pointsOfSale.length === 0 || force) {
      APIHelper.getResource(`users/${id}/pointsofsale`).then((posResponse) => {
        const pointsOfSale = posResponse.map(
          (pos: any) => PointOfSaleTransformer.makePointOfSale(pos),
        );

        this.context.commit('setUserPointsOfSale', pointsOfSale);
      });
    }
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchUserRequestedPointsOfSale(id: number, force: boolean = false) {
    if (this.requestedPointsOfSale.length === 0 || force) {
      APIHelper.getResource(`users/${id}/pointsofsale/updated`).then((posResponse) => {
        const pointsOfSale = posResponse.map(
          (pos: any) => PointOfSaleTransformer.makePointOfSale(pos),
        );

        this.context.commit('setUserRequestedPointsOfSale', pointsOfSale);
      });
    }
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchPointOfSale(id: number) {
    APIHelper.getResource(`pointsofsale/${id}`).then((posResponse) => {
      const pointsOfSale = PointOfSaleTransformer.makePointOfSale(posResponse);

      this.context.commit('updatePointOfSale', pointsOfSale);
    });
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchRequestedPointOfSale(id: number) {
    APIHelper.getResource(`pointsofsale/${id}/update`).then((posResponse) => {
      const pointsOfSale = PointOfSaleTransformer.makePointOfSale(posResponse);

      this.context.commit('updateRequestedPointOfSale', pointsOfSale);
    });
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  postPointOfSale(pointOfSale: any) {
    APIHelper.postResource('pointsofsale', pointOfSale).then((posResponse) => {
      const addedPointOfSale = PointOfSaleTransformer.makePointOfSale(posResponse);
      this.context.commit('addRequestedPointOfSale', addedPointOfSale);
    });
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  patchPointOfSale(pointOfSale: PointOfSale) {
    APIHelper.patchResource(`pointsofsale/${pointOfSale.id}`, pointOfSale).then((posResponse) => {
      const patchedPointOfSale = PointOfSaleTransformer.makePointOfSale(posResponse);
      this.context.commit('updateRequestedPointOfSale', patchedPointOfSale);
    });
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  approvePointOfSale(id: number) {
    APIHelper.postResource(`pointsofsale/${id}/approve`).then((posResponse) => {
      const approvedPointOfSale = PointOfSaleTransformer.makePointOfSale(posResponse);
      this.context.commit('updateRequestedPointOfSale', approvedPointOfSale);
    });
  }
}
