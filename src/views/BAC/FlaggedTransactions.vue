<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('flagged.Flagged transactions') }}</h1>
    <FlaggedTransactionsComponent
      :selfBought="false"
      :putInByYou="false"
      :putInForYou="false"
      :csv="false"
    />
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import FlaggedTransactionsComponent from '@/components/FlaggedTransactionsTable.vue';

  @Component({
    components: {
      FlaggedTransactionsComponent,
    },
  })
export default class FlaggedTransactions extends Vue {
}
</script>

<style lang="scss" scoped>

</style>
