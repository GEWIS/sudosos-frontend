import APIHelper from '@/mixins/APIHelper';
import PaginationTransformer from '@/transformers/PaginationTransformer';
import ProductCategoryTransformer from '@/transformers/ProductCategoryTransformer';

export function getProductCategories(take: number | null = null, skip: number | null = null) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource('productcategories', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (productcategory: any) => ProductCategoryTransformer.makeProductCategory(productcategory),
    );

    return response;
  });
}

export function postProductCategory(productcategory: any) {
  return APIHelper.postResource('productcategories', productcategory).then((response) => ProductCategoryTransformer.makeProductCategory(response));
}

export function getProductCategory(id: number) {
  return APIHelper.getResource(`productcategories/${id}`).then((response) => ProductCategoryTransformer.makeProductCategory(response));
}

export function patchProductCategory(id: number, productcategory: any) {
  return APIHelper.patchResource(`productcategories/${id}`, productcategory).then((response) => ProductCategoryTransformer.makeProductCategory(response));
}
