<template>
  <!--  <div v-if="elementsOptions.clientSecret">-->
  <div>
    <div class="form-row">
      <!--
        Using a label with a for attribute that matches the ID of the
        Element container enables the Element to automatically gain focus
        when the customer clicks on the label.
      -->
      <label for="ideal-bank-element">
        iDEAL Bank
      </label>.
      <div id="ideal-bank-element">
        <!-- A Stripe Element will be inserted here. -->
      </div>
    </div>

    <button @click="pay">Submit Payment</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import stripeDeposit from '@/api/stripe';

@Component
export default class IncreaseSaldo extends Vue {
  private idealBank = null;

  private pk = 'pk_test_51L2gp5Dc07FvE4beZcK9p6086vtUEtemNfBntoGXoeKDWRLdmgRp4aighjD8R6b9e4hsNiucz7sNXhB6XEEL2IUy00LPiofvlm';

  private elementsOptions = {
    clientSecret: undefined,
    appearance: {}, // appearance options
  };

  private confirmParams = {
    return_url: 'http://localhost:8080/', // success url
  };

  get stripeElements() {
    return this.$stripe.elements();
  }

  async beforeMount() {
    const options = {
      // Custom styling can be passed to options when creating an Element
      style: {
        base: {
          padding: '10px 12px',
          color: '#32325d',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
      },
    };
    await this.generatePaymentIntent();
    this.idealBank = this.stripeElements.create('idealBank', options);
    this.idealBank.mount('#ideal-bank-element');
    console.error(this.idealBank);
  }

  async generatePaymentIntent() {
    const deposit = {
      amount: {
        amount: 2000,
        precision: 2,
        currency: 'EUR',
      },
    };
    const paymentIntent = await stripeDeposit(deposit);
    this.elementsOptions.clientSecret = paymentIntent.clientSecret;
  }

  pay() {
    // Redirects away from the client
    this.$stripe.confirmIdealPayment(
      this.elementsOptions.clientSecret,
      {
        payment_method: {
          ideal: this.idealBank,
          // billing_details: {
          //   name: accountholderName.value,
          // },
        },
        return_url: 'http://localhost:8080/',
      },
    );
  }
}
</script>

<style scoped lang="scss">

#ideal-bank-element {
  min-width: 500px;
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
