<template>
  <b-alert :show="hasDeposits" class="deposit-processing-alert">
    <font-awesome-icon icon="info-circle"/> {{$t('c_depositAlert.message')}}
  </b-alert>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import { getModule } from 'vuex-module-decorators';
import UserModule from '@/store/modules/user';
import { getProcessingDeposits } from '@/api/stripe';

@Component
export default class DepositProcessingAlert extends Vue {
  private userState = getModule(UserModule);

  private hasDeposits = false;

  mounted() {
    const { id } = this.userState.self;
    getProcessingDeposits(id).then((res: any) => {
      this.hasDeposits = res.length > 0;
    });
  }
}
</script>

<style scoped lang="scss">
  .deposit-processing-alert {
    svg {
      margin-right: 0.5rem;
    }
  }
</style>
