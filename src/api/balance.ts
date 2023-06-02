import APIHelper from '@/mixins/APIHelper';
import UserTransformer, { BalanceResponse } from '@/transformers/UserTransformer';
import dinero from 'dinero.js';

export default function getUserBalance(id: Number): Promise<dinero.Dinero> {
  return APIHelper.getResource(`balances/${id}`).then((response: BalanceResponse) => UserTransformer.makeSaldo(response));
}

export function getSelfBalance(): Promise<dinero.Dinero> {
  return APIHelper.getResource('balances').then((response: BalanceResponse) => UserTransformer.makeSaldo(response));
}

export function getAllBalances(payload: {date? : string, minBalance?: number, maxBalance? : number,
  orderBy? : string, orderDirection?: string, take?: number, skip?: number}) {
  return APIHelper.getResource('balances/all', payload).then((response) => response);
}
