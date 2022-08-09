import APIHelper from '@/mixins/APIHelper';

export interface Deposit {
  amount : {
    amount: number,
    precision: number,
    currency: string,
  }
}

export default function stripeDeposit(deposit: Deposit) {
  return APIHelper.postResource('stripe/deposit', deposit).then((response) => response);
}
