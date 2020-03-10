<template>
  <div id="saldo-box"> <!-- to be replaced by card component -->
    <b-card>
      <b-card-title>
        saldo
      </b-card-title>
      <b-card-body>
        <p id="saldo-text" class="lead">
          €{{ user.saldo.toFixed(2).toString().replace(".", ",") }}
        </p>
      </b-card-body>
    </b-card>
    <b-card-footer>
      <router-link to="/saldo">online opwaarderen</router-link>
    </b-card-footer>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { User } from '@/entities/User';

@Component
export default class CurrentSaldo extends Vue {
  @Prop({ type: Object as () => User }) private user!: User;
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
