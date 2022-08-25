<template>
  <div id="saldo-box"> <!-- to be replaced by card component -->
    <b-card>
      <b-card-title>
        Increase saldo
      </b-card-title>
      <b-card-body class="mb-0">
        <p class="mb-2">
          It is no longer possible to increase your balance in cash during the 'borrel'.</p>
        <b-row class="mb-3">
          <b-col class="font-weight-bold">
            Balance Increase amount:
            <b-input-group size="sm" prepend="€" class="input-group">
              <b-form-input v-model="whole" placeholder="00" type="number" min="0"></b-form-input>
              <b-form-input v-model="decimal" placeholder="00" type="number" min="0"></b-form-input>
            </b-input-group>
          </b-col>
        </b-row>
        <b-row class="mt-3">
          <b-col>
          <b-button
            variant="primary"
            class="mx-1 my-1 my-sm-0"
            v-on:click="pay">
            Start Payment
          </b-button>
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>
    <b-modal id="payment-modal" :lazy="false" hide-header-close>
      <p> You will be topping up with €{{ whole }},{{decimal}} </p>
      <form ref="payment" id="payment-form" v-show="!loading">
        <div id="payment-element">
          <!--Stripe.js injects the Payment Element-->
        </div>
      </form>
      <template v-slot:modal-footer="{ }">
        <b-button
          variant="primary"
          :disabled="loading"
          class="btn-empty"
          @click="cancelPay"
        >{{ $t('c_productEditModal.cancel') }}
        </b-button>
        <b-button
          variant="primary"
          :disabled="loading"
          class="btn-primary"
          @click="submitPay">
          PAY
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import stripeDeposit from '@/api/stripe';
import { loadStripe } from '@stripe/stripe-js';

@Component
export default class IncreaseSaldo extends Vue {
  whole = 0;

  decimal = 0;

  stripe: any;

  async beforeMount() {
    this.stripe = await loadStripe(process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY);
  }

  async cancelPay() {
    this.paymentElement.destroy();
    this.$bvModal.hide('payment-modal');
  }

  async submitPay() {
    this.setLoading(true);
    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: process.env.VUE_APP_STRIPE_RETURN_URL,
      },
    });
    this.setLoading(false);
  }

  elements: any = undefined;

  paymentElement: any = undefined;

  async pay() {
    const amount = Number(this.whole) * 100 + Number(this.decimal);
    const deposit = {
      amount: {
        amount,
        precision: 2,
        currency: 'EUR',
      },
    };
    const paymentIntent = await stripeDeposit(deposit);
    this.elements = this.stripe.elements({ clientSecret: paymentIntent.clientSecret });
    this.paymentElement = this.elements.create('payment');
    this.$bvModal.show('payment-modal');
    await this.$nextTick();
    this.paymentElement.mount('#payment-element');
  }

  loading: boolean = false;

  setLoading(isLoading: boolean) {
    this.loading = isLoading;
  }
}
</script>

<style scoped lang="scss">
@import './src/styles/Card.scss';

#ideal-bank-element {
  max-width: 200px;
}

.input-group {
  max-width: 200px;
}

input,
.StripeElement {
  color: #32325d;
  background-color: white;
  border: 1px solid transparent;
  border-radius: 4px;

  box-shadow: 0 1px 3px 0 #e6ebf1;
  -webkit-transition: box-shadow 150ms ease;
  transition: box-shadow 150ms ease;
}

input {
  padding: 10px 12px;
}

input:focus,
.StripeElement--focus {
  box-shadow: 0 1px 3px 0 #cfd7df;
}
</style>
