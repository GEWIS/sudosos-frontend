<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('managePOS.Manage points of sale') }}</h1>
    <POSOverview :full="true" :show-all="true"></POSOverview>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import POSOverview from '@/components/POSOverview.vue';

  @Component({
    components: {
      POSOverview,
    },
  })
export default class ManagePointOfSale extends Vue {
}
</script>

<style scoped lang="scss"></style>
