<template>
  <div>
    <b-row>
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('c_transferDetails.Total') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transfer.amount.toFormat() }}</p>
      </b-col>
    </b-row>
    <b-row v-if="Object.keys(transfer.from).length !== 0">
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('c_transferDetails.From') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transfer.from.name }}</p>
      </b-col>
    </b-row>
    <b-row v-if="Object.keys(transfer.to).length !== 0">
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('c_transferDetails.To') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transfer.to.name }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('c_transferDetails.Type') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transferType }}</p>
      </b-col>
    </b-row>
    <b-row v-if="transfer.description !== undefined">
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('c_transferDetails.Description') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transfer.description }}</p>
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Transfer } from '@/entities/Transfer';

@Component
export default class TransferDetails extends Vue {
  @Prop() transfer: Transfer | undefined;

  get transferType() {
    if (this.transfer.invoice != null) return this.$t('c_transferDetails.Invoice');
    if (this.transfer.deposit != null) return this.$t('c_transferDetails.Deposit');
    if (this.transfer.payoutRequest != null) return this.$t('c_transferDetails.PayoutRequest');
    if (this.transfer.to != null && this.transfer.to.id != null
      && this.transfer.from != null && this.transfer.from.id != null) {
      return this.$t('c_transferDetails.Transfer');
    }
    return this.$t('c_transferDetails.Other');
  }
}
</script>

<style lang="scss" scoped>
.row p {
  margin-bottom: 0.25rem;
}
</style>
