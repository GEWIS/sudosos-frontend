<template>
  <b-container>
    <b-row>
      <b-col>
        <h1 id="overzicht">Overzicht</h1>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="3">
        <CurrentSaldo :user="user"/>
      </b-col>
      <b-col cols="9">
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
  #overzicht {
    padding: 5rem 0 1rem 0;
  }
</style>
