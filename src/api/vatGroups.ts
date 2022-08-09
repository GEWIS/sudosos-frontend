import APIHelper from '@/mixins/APIHelper';
import PaginationTransformer from '@/transformers/PaginationTransformer';
import { VatGroupList } from '@/entities/VatGroup';

export default function getVatGroups(take: number | null = null, skip: number | null = null):
  Promise<VatGroupList> {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource('vatgroups', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    return response;
  });
}
