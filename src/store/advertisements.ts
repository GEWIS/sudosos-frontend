import { Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { Banner } from '@/entities/Banner';
import APIHelper from '@/mixins/APIHelper';

@Module({ namespaced: true, name: 'Advertisements' })
class Advertisements extends VuexModule {
  advertisements: Banner[] = [];

  @Mutation
  getAdvertisements() {
    this.advertisements = [];
    // this.advertisements = APIHelper.getResource('advertisements');
  }

  @Mutation
  addAdvertisement(advertisement: Banner) {
    // APIHelper.postResource('advertisements');
    this.advertisements.push(advertisement);
  }

  @Mutation
  removeAdvertisement(advertisement: Banner) {
    // APIHelper.delResource('advertisements');
    const index = this.advertisements.findIndex(adv => adv.id === advertisement.id);
    this.advertisements.splice(index, 1);
  }

  @Mutation
  updateAdvertisement(advertisement: Banner) {
    // APIHelper.putResource('advertisements');
    const index = this.advertisements.findIndex(adv => adv.id === advertisement.id);
    this.advertisements[index] = advertisement;
  }
}

export default Advertisements;
