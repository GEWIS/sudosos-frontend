import APIHelper from '@/mixins/APIHelper';
import PaginationTransformer from '@/transformers/PaginationTransformer';
import { PayoutRequestFilter } from '@/entities/PayoutRequest';
import PayoutRequestTransformer from '@/transformers/PayoutRequestTransformer';

export function getPayoutRequests(
  filter: PayoutRequestFilter, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...filter,
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource('payoutrequests', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (payout: any) => PayoutRequestTransformer.makePayoutRequest(payout),
    );

    return response;
  });
}

export function postPayoutRequest(request: any) {
  return APIHelper.postResource('payoutrequests', request).then((response) => PayoutRequestTransformer.makePayoutRequest(response));
}

export function getPayoutRequest(id: number) {
  return APIHelper.getResource(`payoutrequests/${id}`).then((response) => PayoutRequestTransformer.makePayoutRequest(response));
}

export function postPayoutRequestStatus(id: number, request: any) {
  APIHelper.postResource(`payoutrequests/${id}/status`, request);
}
