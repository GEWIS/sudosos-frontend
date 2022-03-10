import APIHelper from '@/mixins/APIHelper';
import PointOfSaleTransformer from '@/transformers/PointOfSaleTransformer';
import { PointOfSale } from '@/entities/PointOfSale';
import PaginationTransformer from '@/transformers/PaginationTransformer';
import ContainerTransformer from '@/transformers/ContainerTransformer';
import ProductTransformer from '@/transformers/ProductTransformer';

export function postPointOfSale(pos: any) {
  return APIHelper.postResource('pointsofsale', pos).then((response) => PointOfSaleTransformer.makePointOfSale(response) as PointOfSale);
}

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

export function getPointOfSale(posID: number) {
  return APIHelper.getResource(`pointsofsale/${posID}`).then((response) => PointOfSaleTransformer.makePointOfSale(response) as PointOfSale);
}

export function patchPointOfSale(posID: number, pos: any) {
  return APIHelper.patchResource(`pointsofsale/${posID}`, pos).then((response) => PointOfSaleTransformer.makePointOfSale(response) as PointOfSale);
}

export function getPointOfSaleContainers(
  id: number, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource(`pointsofsale/${id}/containers`, body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (container: any) => ContainerTransformer.makeContainer(container),
    );

    return response;
  });
}

export function getPointOfSaleProducts(
  id: number, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource(`pointsofsale/${id}/products`, body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (product: any) => ProductTransformer.makeProduct(product),
    );

    return response;
  });
}

export function getPointOfSaleUpdate(id: number) {
  return APIHelper.getResource(`pointsofsale/${id}/update`).then((response) => PointOfSaleTransformer.makePointOfSale(response) as PointOfSale);
}

export function getPointsOfSaleUpdates(take: number | null = null, skip: number | null = null) {
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

export function approvePointOfSale(id: number) {
  return APIHelper.postResource(`pointsofsale/${id}/approve`, {}).then((response) => PointOfSaleTransformer.makePointOfSale(response));
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
