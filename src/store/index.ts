import Vue from 'vue';
import Vuex from 'vuex';
import CurrentUser from '@/store/user';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    currentUser: CurrentUser,
  },
});
