<template>
  <div id="SaldoBox"> <!-- to be replaced by card component -->
    <b-card>
      <b-card-title>
        saldo
      </b-card-title>
      <b-card-body>
        <p id="SaldoText">
          {{ user.saldo.toFixed(2).toString().replace(".", ",") }}
        </p>
      </b-card-body>
    </b-card>
    <b-card-footer href="#">
      online opwaarderen
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
@import '@/styles/Card.scss';
#SaldoBox {
  padding: 5px;
  width: 15rem;
}

#SaldoText {
  font-weight: bolder;
  font-size: 50px;
  text-align: center;
}

#SaldoBox > .card {
  padding-left: 2rem;
}
</style>
