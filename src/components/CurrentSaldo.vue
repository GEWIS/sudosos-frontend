<template>
  <div id="saldo-box"> <!-- to be replaced by card component -->
    <b-card>
      <b-card-title>
        {{ $t('saldoCom.saldo') }}
      </b-card-title>
      <b-card-body>
        <p v-if="userState.user.saldo !== undefined" id="saldo-text" class="lead">
          {{ userState.user.saldo.toFormat() }}
        </p>
        <div v-else class="text-center">
          <b-spinner variant="primary" id="saldo-spinner"></b-spinner>
        </div>
      </b-card-body>
    </b-card>
    <b-card-footer>
      <router-link to="/saldo" custom v-slot="{ navigate }">
        <span @click="navigate" @keypress.enter="navigate" role="link">
          {{ $t('saldoCom.upgrade online') }}
        </span>
      </router-link>
    </b-card-footer>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Formatters from '@/mixins/Formatters';
import UserModule from '@/store/modules/user';

@Component
export default class CurrentSaldo extends Formatters {
  private userState = getModule(UserModule);

  beforeMount() {
    this.userState.fetchBalance();
  }
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

#saldo-spinner {
  height: 70px;
  width: 70px;
  margin-bottom: 1rem;
}
</style>
