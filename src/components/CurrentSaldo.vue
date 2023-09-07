<template>
  <div id="saldo-box"> <!-- to be replaced by card component -->
    <b-card>
      <b-card-title>
        {{ $t('c_currentSaldo.saldo') }}
      </b-card-title>
      <b-card-body>
        <div v-if="userState.self.balance !== undefined">
          <p id="saldo-text" class="lead">
            {{ userState.self.balance.balance.toFormat() }}
          </p>
          <p
            v-if="userState.self.balance.fine !== undefined"
            id="saldo-fine"
          >
            {{ $t('c_currentSaldo.of which') }}
            <span id="saldo-fine-amount">-{{ userState.self.balance.fine.toFormat() }}</span>
            {{ $t('c_currentSaldo.fine') }}
          </p>
        </div>
        <div v-else class="text-center">
          <b-spinner variant="primary" id="saldo-spinner"></b-spinner>
        </div>
      </b-card-body>
    </b-card>
    <b-card-footer>
      <router-link to="/saldo" custom v-slot="{ navigate }">
        <span @click="navigate" @keypress.enter="navigate" role="link">
          {{ $t('c_currentSaldo.upgrade online') }}
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
  userState = getModule(UserModule);

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

#saldo-fine {
  text-align: center;
  font-style: italic;
}

#saldo-fine-amount {
  font-weight: bold;
  color: red;
}

#saldo-spinner {
  height: 70px;
  width: 70px;
  margin-bottom: 1rem;
}
</style>
