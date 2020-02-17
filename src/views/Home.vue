<template>
  <div class="home">
    <h1>SudoSOS Homepage</h1>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Vue } from 'vue-property-decorator';
import { User } from '@/entities/User';

@Component({
  components: {},
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
