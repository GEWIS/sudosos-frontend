<template>
  <div id="Home">
    <div id="HomePageContainer">
      <h1 id="Overzicht">Overzicht</h1>
      <div id="ContentContainer">
        <CurrentSaldo :user="user"/>
        <RecentTransactions :user="user"/>
      </div>
    </div>
  </div>
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
#ContentContainer {
  display: flex;
}

#Overzicht {
  font-weight: bold;
  padding: 10px;
}

#HomePageContainer {
  display: grid;
  justify-content: center;
  padding-top: 5rem;
}
</style>
