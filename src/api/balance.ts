import APIHelper from '@/mixins/APIHelper';
import UserTransformer from '@/transformers/UserTransformer';

export default function getUserBalance(id: Number) {
  return APIHelper.getResource(`balances/${id}`).then((response) => UserTransformer.makeSaldo(response));
}
