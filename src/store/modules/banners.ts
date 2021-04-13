import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import { Banner } from '@/entities/Banner';
import APIHelper from '@/mixins/APIHelper';
import BannerTransformer from '@/transformers/BannerTransformer';

@Module({
  dynamic: true, namespaced: true, store, name: 'BannerModule',
})
export default class BannerModule extends VuexModule {
  banners: Banner[] = [];

  @Mutation
  setBanners(banners: Banner[]) {
    this.banners = banners;
  }

  @Mutation
  addBanner(banner: Banner) {
    const bannerResponse = APIHelper.postResource('banner', banner);
    this.banners.push(BannerTransformer.makeBanner(bannerResponse));
  }

  @Mutation
  removeBanner(banner: Banner) {
    APIHelper.delResource('banners', banner);
    const index = this.banners.findIndex(bnr => bnr.id === banner.id);
    this.banners.splice(index, 1);
  }

  @Mutation
  updateBanner(banner: {}) {
    const response = APIHelper.putResource('banners', banner);
    const bannerResponse = BannerTransformer.makeBanner(response);
    const index = this.banners.findIndex(bnr => bnr.id === bannerResponse.id);
    this.banners.splice(index, 1, bannerResponse);
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchBanners(force: boolean = false) {
    if (this.banners.length === 0 || force) {
      const bannersResponse = APIHelper.getResource('banners') as [];
      const bnrs = bannersResponse.map(banner => BannerTransformer.makeBanner(banner));
      this.context.commit('setBanners', bnrs);
    }
  }
}
