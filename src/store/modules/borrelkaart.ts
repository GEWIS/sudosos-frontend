import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import { User } from '@/entities/User';
import APIHelper from '@/mixins/APIHelper';
import UserTransformer from '@/transformers/UserTransformer';

@Module({
  dynamic: true, namespaced: true, store, name: 'borrelkaartModule',
})
export default class BorrelkaartModule extends VuexModule {
  borrelkaarten: User[] = [];

  @Mutation
  reset() {
    this.borrelkaarten = [];
  }

  @Mutation
  setBorrelkaarten(borrelkaarten: User[]) {
    this.borrelkaarten = borrelkaarten;
  }

  @Mutation
  addBorrelkaart(borrelkaart: Object) {
    const borrelkaartResponse = APIHelper.postResource('borrelkaart', borrelkaart);
    this.borrelkaarten.push(UserTransformer.makeUser(borrelkaartResponse) as User);
  }

  @Mutation
  removeBorrelkaart(borrelkaart: User) {
    APIHelper.delResource('borrelkaarten').then(() => {
      const index = this.borrelkaarten.findIndex((brlkrt) => brlkrt.id === borrelkaart.id);
      this.borrelkaarten.splice(index, 1);
    });
  }

  @Mutation
  updateBorrelkaart(borrelkaart: {}) {
    const response = APIHelper.putResource('borrelkaarten', borrelkaart);
    const borrelkaartResponse = UserTransformer.makeUser(response) as User;
    const index = this.borrelkaarten.findIndex((brlkrt) => brlkrt.id === borrelkaartResponse.id);
    this.borrelkaarten.splice(index, 1, borrelkaartResponse);
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchBorrelkaarten(force: boolean = false) {
    if (this.borrelkaarten.length === 0 || force) {
      APIHelper.getResource('borrelkaarten').then((borrelkaartenResponse: User[]) => {
        const borrelkaartenFormat = borrelkaartenResponse.map(
          (borrelkaart) => (UserTransformer.makeUser(borrelkaart)),
        );
        this.context.commit('setBorrelkaarten', borrelkaartenFormat);
      });
    }
  }
}
