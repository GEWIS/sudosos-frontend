import APIHelper from '@/mixins/APIHelper';
import UserTransformer, { BalanceResponse } from '@/transformers/UserTransformer';
import dinero from 'dinero.js';
import { Balance } from '@/entities/Balance';

export default function getUserBalance(id: Number): Promise<Balance> {
  return APIHelper.getResource(`balances/${id}`).then((response: BalanceResponse) => UserTransformer.makeBalance(response));
}

export function getSelfBalance(): Promise<Balance> {
  return APIHelper.getResource('balances').then((response: BalanceResponse) => UserTransformer.makeBalance(response));
}
