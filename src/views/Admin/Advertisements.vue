<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('advertisements.Advertisements') }}</h1>
    <AdvertisementsList></AdvertisementsList>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import AdvertisementsList from '@/components/AdvertisementsList.vue';

  @Component({
    components: {
      AdvertisementsList,
    },
  })

export default class Advertisements extends Vue {
}
</script>

<style lang="scss" scoped>
</style>
