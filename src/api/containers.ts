import ContainerTransformer from '@/transformers/ContainerTransformer';
import APIHelper from '@/mixins/APIHelper';
import PaginationTransformer from '@/transformers/PaginationTransformer';
import ProductTransformer from '@/transformers/ProductTransformer';

export function getContainers(take: number | null = null, skip: number | null = null) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource('containers', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (container: any) => ContainerTransformer.makeContainer(container),
    );

    return response;
  });
}

export function postContainer(container: any) {
  return APIHelper.postResource('containers', container).then((response) => ContainerTransformer.makeContainer(response));
}

export function getContainer(id: number) {
  return APIHelper.getResource(`containers/${id}`).then((response) => ContainerTransformer.makeContainer(response));
}

export function patchContainer(id: number, container: any) {
  return APIHelper.patchResource(`containers/${id}`, container).then((response) => ContainerTransformer.makeContainer(response));
}

export function getContainerProducts(
  id: number, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource(`containers/${id}/products`, body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (product: any) => ProductTransformer.makeProduct(product),
    );

    return response;
  });
}

export function approveContainer(id: number) {
  return APIHelper.postResource(`containers/${id}/approve`, {}).then((response) => ContainerTransformer.makeContainer(response));
}

export function getPublicContainers(take: number | null = null, skip: number | null = null) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource('containers/public', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (container: any) => ContainerTransformer.makeContainer(container),
    );

    return response;
  });
}

export function getUpdatedContainers(take: number | null = null, skip: number | null = null) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource('containers/updated', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (container: any) => ContainerTransformer.makeContainer(container),
    );

    return response;
  });
}

export function getUpdatedContainer(id: number) {
  return APIHelper.getResource(`containers/${id}/update`).then((response) => ContainerTransformer.makeContainer(response));
}

export function getUserContainers(
  id: number, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource(`users/${id}/containers`, body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (container: any) => ContainerTransformer.makeContainer(container),
    );

    return response;
  });
}

export function getUserUpdatedContainers(
  id: number, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource(`users/${id}/containers/updated`, body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (container: any) => ContainerTransformer.makeContainer(container),
    );

    return response;
  });
}
