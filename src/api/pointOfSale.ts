import APIHelper from '@/mixins/APIHelper';
import PointOfSaleTransformer from '@/transformers/PointOfSaleTransformer';
import { PointOfSale } from '@/entities/PointOfSale';
import PaginationTransformer from '@/transformers/PaginationTransformer';

export function getAllPointsOfSale(take: number | null = null, skip: number | null = null) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource('pointsofsale', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (pos: any) => PointOfSaleTransformer.makePointOfSale(pos),
    );

    return response;
  });
}

export function getUserPointsOfSale(
  userID: number, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource(`users/${userID}/pointsofsale`, body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (pos: any) => PointOfSaleTransformer.makePointOfSale(pos),
    );

    return response;
  });
}

export function getPointOfSale(posID: number) {
  return APIHelper.getResource(`pointsofsale/${posID}`).then((posResponse) => PointOfSaleTransformer.makePointOfSale(posResponse) as PointOfSale);
}

export function getPointOfSaleUpdate(posID: number) {
  return APIHelper.getResource(`pointsofsale/${posID}/update`).then((posResponse) => PointOfSaleTransformer.makePointOfSale(posResponse) as PointOfSale);
}

export function getRequestedPointsOfSale(take: number | null = null, skip: number | null = null) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource('pointsofsale/updated', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (pos: any) => PointOfSaleTransformer.makePointOfSale(pos),
    );

    return response;
  });
}

export function getUserRequestedPointsOfSale(
  userID: number, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource(`users/${userID}/pointsofsale/updated`, body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (pos: any) => PointOfSaleTransformer.makePointOfSale(pos),
    );

    return response;
  });
}
