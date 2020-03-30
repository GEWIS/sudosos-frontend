<template>
  <b-container fluid="lg">
  <h1>Point of Sale request page</h1>
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
