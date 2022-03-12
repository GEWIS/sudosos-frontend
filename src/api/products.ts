import APIHelper from '@/mixins/APIHelper';
import PaginationTransformer from '@/transformers/PaginationTransformer';
import ProductTransformer from '@/transformers/ProductTransformer';

export function getProducts(take: number | null = null, skip: number | null = null) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource('products', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (product: any) => ProductTransformer.makeProduct(product),
    );

    return response;
  });
}

export function postProduct(product: any, image: FormData) {
  return APIHelper.postResource('products', product).then((response) => APIHelper.postFile(`product/${response.id}/image`, image)).then((response) => ProductTransformer.makeProduct(response));
}

export function getProduct(id: number) {
  return APIHelper.getResource(`products/${id}`).then((response) => ProductTransformer.makeProduct(response));
}

export function patchProduct(id: number, product: any) {
  return APIHelper.patchResource(`products/${id}`, product).then((response) => ProductTransformer.makeProduct(response));
}

export function deleteProduct(id: number) {
  return APIHelper.delResource(`products/${id}`);
}

export function approveProduct(id: number) {
  return APIHelper.postResource(`products/${id}/approve`, {}).then((response) => ProductTransformer.makeProduct(response));
}

export function getUpdatedProducts(take: number | null = null, skip: number | null = null) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource('products/update', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (product: any) => ProductTransformer.makeProduct(product),
    );

    return response;
  });
}

export function getUpdatedProduct(id: number) {
  return APIHelper.getResource(`products/${id}/update`).then((response) => ProductTransformer.makeProduct(response));
}

export function postProductImage(id: number, image: FormData) {
  return APIHelper.postFile(`products/${id}/image`, image).then((response) => ProductTransformer.makeProduct(response));
}

export function getUserProducts(
  id: number, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource(`users/${id}/products`, body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (product: any) => ProductTransformer.makeProduct(product),
    );

    return response;
  });
}

export function getUserUpdatedProducts(
  id: number, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource(`users/${id}/products/updated`, body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (product: any) => ProductTransformer.makeProduct(product),
    );

    return response;
  });
}
