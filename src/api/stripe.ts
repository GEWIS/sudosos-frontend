import APIHelper from '@/mixins/APIHelper';

export default function stripeDeposit(deposit: any) {
  return APIHelper.postResource('strip/deposit', deposit).then((response) => response);
}
