import APIHelper from '@/mixins/APIHelper';
import BorrelkaartGroupTransformer from '@/transformers/BorrelkaartGroupTransformer';
import PaginationTransformer from '@/transformers/PaginationTransformer';

export function getBorrelkaartGroups(take: number | null = null, skip: number | null = null) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource('borrelkaartgroups', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (bkg: any) => BorrelkaartGroupTransformer.makeBorrelkaartGroup(bkg),
    );

    return response;
  });
}

export function postBorrelKaartGroup(bkg: any) {
  return APIHelper.postResource('borrelkaartgroups', bkg).then((response) => BorrelkaartGroupTransformer.makeBorrelkaartGroup(response));
}

export function getBorrelKaartGroup(id: number) {
  return APIHelper.getResource(`borrelkaartgroups/${id}`).then((response) => BorrelkaartGroupTransformer.makeBorrelkaartGroup(response));
}

export function patchBorrelkaartGroup(id: number, bkg: any) {
  return APIHelper.patchResource(`borrelkaartgroups/${id}`, bkg).then((response) => BorrelkaartGroupTransformer.makeBorrelkaartGroup(response));
}

export function deleteBorrelkaartGroups(id: number) {
  return APIHelper.delResource(`borrelkaartgroups/${id}`);
}
