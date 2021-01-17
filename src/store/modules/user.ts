import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import Dinero from 'dinero.js';
import { User } from '@/entities/User';
import APIHelper from '@/mixins/APIHelper';
import UserTransformer from '@/transformers/UserTransformer';

@Module({ namespaced: true, name: 'user' })
class UserModule extends VuexModule {
  user: User = {} as User;

  get getUser() {
    if (Object.keys(this.user).length) {
      this.fetchUser();
    }
    return this.user;
  }

  @Mutation
  setUser(user: User) {
    this.user = user;
  }

  @Mutation
  updateSaldo(newSaldo: number) {
    this.user.saldo = Dinero({ amount: newSaldo, currency: 'EUR' });
  }

  @Action
  fetchUser() {
    const userResponse = APIHelper.getResource('user') as {};
    this.context.commit('setUser', UserTransformer.makeUser(userResponse));
    const saldoResponse = APIHelper.getResource('saldo') as { saldo: number };
    this.context.commit('updateSaldo', saldoResponse.saldo);
  }
}
