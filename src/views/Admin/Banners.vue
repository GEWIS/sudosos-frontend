<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('banners.Banners') }}</h1>
    <BannerTable></BannerTable>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BannerTable from '@/components/BannerTable.vue';

  @Component({
    components: {
      BannerTable,
    },
  })
export default class Advertisements extends Vue {
}
</script>

<style lang="scss" scoped>
</style>
