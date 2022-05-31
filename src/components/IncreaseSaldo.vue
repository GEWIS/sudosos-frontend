<template>
  <div id="saldo-box"> <!-- to be replaced by card component -->
    <b-card>
      <b-card-title>
        Increase saldo
<!--        {{ $t('c_currentSaldo.saldo') }}-->
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
        <b-row>
          <b-col class="font-weight-bold">
            <form id="payment-form">
              <div id="payment-element">
                <!--Stripe.js injects the Payment Element-->
              </div>
              <button id="submit">
                <div class="spinner hidden" id="spinner"></div>
                <span id="button-text">Pay now</span>
              </button>
              <div id="payment-message" class="hidden"></div>
            </form>
          </b-col>
        </b-row>
        <b-row class="mt-3">
          <b-col>
          <b-button
            variant="primary"
            id="confirmBorrelModeTime"
            class="mx-1 my-1 my-sm-0"
            v-on:click="pay">
            Increase Balance
          </b-button>
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import stripeDeposit from '@/api/stripe';

@Component
export default class IncreaseSaldo extends Vue {
  private idealBank: any = null;

  whole = 0;

  decimal = 0;

  $stripe: any;

  get stripeElements() {
    return this.$stripe.elements();
  }

  async beforeMount() {
    const options = {
      // Custom styling can be passed to options when creating an Element
      style: {
        base: {
          padding: '10px 12px',
          color: '#d40000',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
      },
    };
    this.idealBank = await this.stripeElements.create('idealBank', options);
    this.idealBank.mount('#ideal-bank-element');
  }

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
    // Redirects away from the client
    this.$stripe.confirmIdealPayment(
      paymentIntent.clientSecret,
      {
        payment_method: {
          ideal: this.idealBank,
          // billing_details: {
          //   name: accountholderName.value,
          // },
        },
        return_url: process.env.VUE_APP_STRIPE_RETURN_URL,
      },
    );
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
  height: 40px;

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
