<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('saldo.Saldo') }}</h1>
    <stripe-checkout
      ref="checkoutRef"
      mode="payment"
      :pk="publishableKey"
      :line-items="lineItems"
      :success-url="successURL"
      :cancel-url="cancelURL"
      @loading="v => loading = v"
    />
    <button @click="submit">Pay now!</button>
  </b-container>
</template>

<script>
import { StripeCheckout } from '@vue-stripe/vue-stripe';

export default {
  components: {
    StripeCheckout,
  },
  data() {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    return {
      loading: false,
      lineItems: [
        {
          price: 'some-price-id', // The id of the one-time price you created in your Stripe dashboard
          quantity: 1,
        },
      ],
      successURL: 'your-success-url',
      cancelURL: 'your-cancel-url',
      publishableKey,
    };
  },
  methods: {
    submit() {
      // You will be redirected to Stripe's secure checkout page
      this.$refs.checkoutRef.redirectToCheckout();
    },
  },
};
</script>
