<template>
  <div id="saldo-box"> <!-- to be replaced by card component -->
    <b-card>
      <b-card-title>
        {{ $t('saldoCom.saldo') }}
      </b-card-title>
      <b-card-body>
        <p id="saldo-text" class="lead">
          {{ dinero({amount: currentUser.saldo}).toFormat() }}
        </p>
      </b-card-body>
    </b-card>
    <b-card-footer>
      <router-link to="/saldo">{{ $t('saldoCom.upgrade online') }}</router-link>
    </b-card-footer>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { User } from '@/entities/User';
import Formatters from '@/mixins/Formatters';

@Component
export default class CurrentSaldo extends Formatters {
  public currentUser: User = this.$store.state.currentUser;
}
</script>

<style scoped lang="scss">
@import './src/styles/Card.scss';

#saldo-box {
  width: 100%;
}

#saldo-text {
  font-size: 50px;
  text-align: center;
}
</style>
