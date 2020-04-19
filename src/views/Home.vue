<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('home.Overview') }}</h1>
    <b-row>
      <b-col lg="3" class="d-none d-lg-block">
        <CurrentSaldo></CurrentSaldo>
      </b-col>
      <b-col cols="12" lg="9">
        <RecentTransactions></RecentTransactions>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { User } from '@/entities/User';
import RecentTransactions from '@/components/RecentTransactions.vue';
import CurrentSaldo from '@/components/CurrentSaldo.vue';

  @Component({
    components: {
      RecentTransactions, CurrentSaldo,
    },
  })

export default class Home extends Vue {
    public user: User = {
      id: '8549',
      firstName: 'Pieter',
      lastName: 'Ebbers',
      saldo: 12,
      organs: [],
    };
}
</script>

<style scoped lang="scss">

</style>
