import { getModule } from 'vuex-module-decorators';
import UserModule from '@/store/modules/user';
import VueRouter, { NavigationGuardNext } from 'vue-router';
import APIHelper from '@/mixins/APIHelper';
import BannerModule from '@/store/modules/banners';
import BorrelkaartModule from '@/store/modules/borrelkaart';
import BorrelkaartGroupModule from '@/store/modules/borrelkaartgroup';
import ContainerModule from '@/store/modules/containers';
import FlaggedTransactionModule from '@/store/modules/flaggedtransaction';
import PointOfSaleModule from '@/store/modules/pointsofsale';
import ProductsModule from '@/store/modules/products';
import TransactionModule from '@/store/modules/transactions';
import TransferModule from '@/store/modules/transfers';

const bannerState = getModule(BannerModule);
const borrelkaartState = getModule(BorrelkaartModule);
const borrelkaartGroupState = getModule(BorrelkaartGroupModule);
const containerState = getModule(ContainerModule);
const flaggedTransactionState = getModule(FlaggedTransactionModule);
const pointOfSaleState = getModule(PointOfSaleModule);
const productsState = getModule(ProductsModule);
const transactionState = getModule(TransactionModule);
const transferState = getModule(TransferModule);
const userState = getModule(UserModule);

export default {
  logout(next: NavigationGuardNext | undefined, router?: VueRouter) {
    APIHelper.clearToken();
    bannerState.reset();
    borrelkaartState.reset();
    borrelkaartGroupState.reset();
    containerState.reset();
    flaggedTransactionState.reset();
    pointOfSaleState.reset();
    productsState.reset();
    transactionState.reset();
    transferState.reset();
    userState.reset();

    if (next) {
      next({ name: 'login' });
    } else if (router) {
      router.push({ name: 'login' });
    }
  },
};
