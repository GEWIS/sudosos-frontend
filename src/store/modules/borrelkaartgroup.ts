/* eslint-disable max-len */

import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import { BorrelkaartGroup } from '@/entities/BorrelkaartGroup';
import APIHelper from '@/mixins/APIHelper';
import BorrelkaartGroupTransformer from '@/transformers/BorrelkaartGroupTransformer';

@Module({ namespaced: true, name: 'borrelkaartGroups' })
export default class BorrelkaartGroupModule extends VuexModule {
  borrelkaartGroups: BorrelkaartGroup[] = [];

  get getBorrelkaartGroups() {
    if (this.borrelkaartGroups.length === 0) {
      this.fetchBorrelkaartGroups();
    }
    return this.borrelkaartGroups;
  }

  @Mutation
  setBorrelkaartGroups(borrelkaartGroups: BorrelkaartGroup[]) {
    this.borrelkaartGroups = borrelkaartGroups;
  }

  @Mutation
  addBorrelkaartGroup(borrelkaartGroup: BorrelkaartGroup) {
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
  updateAdvertisement(borrelkaartGroup: {}) {
    const response = APIHelper.putResource('borrelkaartGroups', borrelkaartGroup);
    const borrelkaartGroupResponse = BorrelkaartGroupTransformer.makeBorrelkaartGroup(response);
    const index = this.borrelkaartGroups.findIndex(brlkrt => brlkrt.id === borrelkaartGroupResponse.id);
    this.borrelkaartGroups[index] = borrelkaartGroupResponse;
  }

  @Action
  fetchBorrelkaartGroups() {
    const borrelkaartGroupsResponse = APIHelper.getResource('borrelkaartGroups') as [];
    borrelkaartGroupsResponse.map(borrelkaartGroup => BorrelkaartGroupTransformer.makeBorrelkaartGroup(borrelkaartGroup));
    this.context.commit('setBorrelkaartGroups', borrelkaartGroupsResponse);
  }
}
