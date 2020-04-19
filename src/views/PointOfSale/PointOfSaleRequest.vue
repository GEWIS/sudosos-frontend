<template>
  <b-container fluid="lg">
  <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('posRequest.Point of Sale request') }}</h1>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Container from '@/components/Container.vue';

  @Component({
    components: { Container },
  })

export default class PointOfSaleRequest extends Vue {
}
</script>

<style lang="scss" scoped>

</style>
