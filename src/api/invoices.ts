import APIHelper from '@/mixins/APIHelper';
import PaginationTransformer from '@/transformers/PaginationTransformer';
import InvoiceTransformer from '@/transformers/InvoiceTransformer';
import { InvoiceFilter } from '@/entities/Invoice';

export function getInvoices(
  filter: InvoiceFilter, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...filter,
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource('invoices', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (invoice: any) => InvoiceTransformer.makeInvoice(invoice),
    );

    return response;
  });
}

export function postInvoice(invoice: any) {
  APIHelper.postResource('invoices', invoice);
}

export function getInvoice(id: number) {
  return APIHelper.getResource(`invoices/${id}`).then((response) => InvoiceTransformer.makeInvoice(response));
}

export function patchInvoice(id: number, invoice: any) {
  return APIHelper.patchResource(`invoices/${id}`, invoice);
}

export function deleteInvoice(id: number) {
  return APIHelper.delResource(`invoices/${id}`);
}
