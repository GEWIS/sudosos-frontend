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
  reset() {
    this.banners = [];
  }

  @Mutation
  setBanners(banners: Banner[]) {
    this.banners = banners;
  }

  @Mutation
  addBanner(banner: Banner) {
    APIHelper.postResource('banners', banner).then((bannerResponse) => {
      this.banners.push(BannerTransformer.makeBanner(bannerResponse));
    });
  }

  @Mutation
  removeBanner(banner: Banner) {
    APIHelper.delResource(`banners/${banner.id}`, banner);
    const index = this.banners.findIndex((bnr) => bnr.id === banner.id);
    this.banners.splice(index, 1);
  }

  @Mutation
  updateBanner(banner: Banner) {
    const response = APIHelper.patchResource(`banners/${banner.id}`, banner);
    const bannerResponse = BannerTransformer.makeBanner(response);
    const index = this.banners.findIndex((bnr) => bnr.id === bannerResponse.id);
    this.banners.splice(index, 1, bannerResponse);
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchBanners(force: boolean = false) {
    if (this.banners.length === 0 || force) {
      APIHelper.getResource('banners').then((bannersResponse) => {
        const banners = bannersResponse.map(
          (banner: any) => BannerTransformer.makeBanner(banner),
        );
        this.context.commit('setBanners', banners);
      });
    }
  }
}
