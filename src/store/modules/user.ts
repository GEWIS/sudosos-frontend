import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import Dinero from 'dinero.js';
import store from '@/store';
import { User, UserPermissions } from '@/entities/User';
import APIHelper from '@/mixins/APIHelper';
import UserTransformer from '@/transformers/UserTransformer';


@Module({ dynamic: true, store, name: 'UserModule' })
export default class UserModule extends VuexModule {
  user: User = {} as User;

  permissions: UserPermissions = {} as UserPermissions;

  @Mutation
  setUser(user: User) {
    this.user = user;
  }

  @Mutation
  updateSaldo(newSaldo: number) {
    this.user.saldo = Dinero({ amount: newSaldo, currency: 'EUR' });
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchUser(force: boolean = false) {
    if (this.user.id === undefined || force) {
      const userResponse = APIHelper.getResource('user') as {};
      this.context.commit('setUser', UserTransformer.makeUser(userResponse));
      const saldoResponse = APIHelper.getResource('saldo') as { saldo: number };
      this.context.commit('updateSaldo', saldoResponse.saldo);
    }
  }

  @Action
  hasPermission(asking: string) {
    if (asking === 'container') {
      return this.permissions.EDIT_ALL_POS_ENTITIES || this.permissions.EDIT_OWN_POS_ENTITIES;
    }

    return false;
  }
}
