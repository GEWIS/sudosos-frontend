<template>
  <b-container fluid="lg">
    <b-row class="mb-lg-3 mb-md-2 mb-1">
      <b-col>
        <h1>{{ $t('home.Overview') }}</h1>
      </b-col>
    </b-row>

    <b-row>
      <b-col lg="3" class="d-none d-lg-block">
        <CurrentSaldo :user="user"/>
      </b-col>
      <b-col cols="12" lg="9">
        <RecentTransactions :user="user"/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
// @ is an alias to /src
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
    public dismissSecs: number = 10;

    public dismissCountDown: number = 0;

    public showDismissibleAlert: boolean = false;

    public user: User = {
      id: '8549',
      firstName: 'Pieter',
      lastName: 'Ebbers',
      saldo: 12,
    };
}
</script>

<style scoped lang="scss">

</style>
