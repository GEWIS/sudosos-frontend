import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import { BorrelkaartGroup } from '@/entities/BorrelkaartGroup';
import APIHelper from '@/mixins/APIHelper';
import BorrelkaartGroupTransformer from '@/transformers/BorrelkaartGroupTransformer';

@Module({
  dynamic: true, namespaced: true, store, name: 'borrelkaartGroupModule',
})
export default class BorrelkaartGroupModule extends VuexModule {
  borrelkaartGroups: BorrelkaartGroup[] = [];

  @Mutation
  reset() {
    this.borrelkaartGroups = [];
  }

  @Mutation
  setBorrelkaartGroups(borrelkaartGroups: BorrelkaartGroup[]) {
    this.borrelkaartGroups = borrelkaartGroups;
  }

  @Mutation
  addBorrelkaartGroup(borrelkaartGroup: Object) {
    const borrelkaartGroupResponse = APIHelper.postResource('borrelkaartGroup', borrelkaartGroup);
    this.borrelkaartGroups.push(
      BorrelkaartGroupTransformer.makeBorrelkaartGroup(borrelkaartGroupResponse),
    );
  }

  @Mutation
  removeBorrelkaartGroup(borrelkaartGroup: BorrelkaartGroup) {
    APIHelper.delResource('borrelkaartGroups').then(() => {
      const index = this.borrelkaartGroups.findIndex((brlkrt) => brlkrt.id === borrelkaartGroup.id);
      this.borrelkaartGroups.splice(index, 1);
    });
  }

  @Mutation
  updateBorrelkaartGroup(borrelkaartGroup: {}) {
    const response = APIHelper.putResource('borrelkaartGroups', borrelkaartGroup);
    const borrelkaartGroupResponse = BorrelkaartGroupTransformer.makeBorrelkaartGroup(response);
    const index = this.borrelkaartGroups.findIndex((brlkrt) => (
      brlkrt.id === borrelkaartGroupResponse.id
    ));
    this.borrelkaartGroups.splice(index, 1, borrelkaartGroupResponse);
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchBorrelkaartGroups(force: boolean = false) {
    if (this.borrelkaartGroups.length === 0 || force) {
      APIHelper.getResource('borrelkaartGroups').then((borrelkaartGroupsResponse: BorrelkaartGroup[]) => {
        const borrelkaartGroupsFormat = borrelkaartGroupsResponse.map((borrelkaartGroup) => (
          BorrelkaartGroupTransformer.makeBorrelkaartGroup(borrelkaartGroup)
        ));
        this.context.commit('setBorrelkaartGroups', borrelkaartGroupsFormat);
      });
    }
  }
}
