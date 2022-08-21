<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">
      {{ $t('socialDrinkCards.Social drink cards overview') }}
    </h1>
    <b-card>
    <BorrelkaartGroupTable />
    </b-card>
  </b-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BorrelkaartGroupTable from '@/components/BorrelkaartGroupTable.vue';

  @Component({
    components: { BorrelkaartGroupTable },
  })
export default class BorrelkaartOverview extends Vue {

}
</script>

<style lang="scss" scoped>
  @import "~bootstrap/scss/bootstrap";
  @import './src/styles/Card.scss';
</style>
