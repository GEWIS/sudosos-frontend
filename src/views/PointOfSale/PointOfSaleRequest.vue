<template>
  <b-container fluid="lg">
  <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('posRequest.Point of Sale request') }}</h1>
    <Containers></Containers>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Containers from '@/components/ContainersOverview.vue';

  @Component({
    components: { Containers },
  })

export default class PointOfSaleRequest extends Vue {
}
</script>

<style lang="scss" scoped>

</style>
