/* eslint-disable max-len */

import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import { BorrelkaartGroup } from '@/entities/BorrelkaartGroup';
import APIHelper from '@/mixins/APIHelper';
import BorrelkaartGroupTransformer from '@/transformers/BorrelkaartGroupTransformer';

@Module({ dynamic: true, store, name: 'borrelkaartGroupModule' })
export default class BorrelkaartGroupModule extends VuexModule {
  borrelkaartGroups: BorrelkaartGroup[] = [];

  @Mutation
  setBorrelkaartGroups(borrelkaartGroups: BorrelkaartGroup[]) {
    this.borrelkaartGroups = borrelkaartGroups;
  }

  @Mutation
  addBorrelkaartGroup(borrelkaartGroup: Object) {
    const borrelkaartGroupResponse = APIHelper.postResource('borrelkaartGroup', borrelkaartGroup);
    this.borrelkaartGroups.push(BorrelkaartGroupTransformer.makeBorrelkaartGroup(borrelkaartGroupResponse));
  }

  @Mutation
  removeBorrelkaartGroup(borrelkaartGroup: BorrelkaartGroup) {
    APIHelper.delResource('borrelkaartGroups', borrelkaartGroup);
    const index = this.borrelkaartGroups.findIndex(brlkrt => brlkrt.id === borrelkaartGroup.id);
    this.borrelkaartGroups.splice(index, 1);
  }

  @Mutation
  updateBorrelkaartGroup(borrelkaartGroup: {}) {
    const response = APIHelper.putResource('borrelkaartGroups', borrelkaartGroup);
    const borrelkaartGroupResponse = BorrelkaartGroupTransformer.makeBorrelkaartGroup(response);
    const index = this.borrelkaartGroups.findIndex(brlkrt => brlkrt.id === borrelkaartGroupResponse.id);
    this.borrelkaartGroups[index] = borrelkaartGroupResponse;
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchBorrelkaartGroups(force: boolean = false) {
    if (this.borrelkaartGroups.length === 0 || force) {
      const borrelkaartGroupsResponse = APIHelper.getResource('borrelkaartGroups') as [];
      const borrelkaartGroupsFormat = borrelkaartGroupsResponse.map(borrelkaartGroup => BorrelkaartGroupTransformer.makeBorrelkaartGroup(borrelkaartGroup));
      this.context.commit('setBorrelkaartGroups', borrelkaartGroupsFormat);
    }
  }
}
