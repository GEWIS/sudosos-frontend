import UserTransformer from '@/transformers/UserTransformer';
import { Invoice, InvoiceEntry, InvoiceStatus } from '@/entities/Invoice';
import Dinero from 'dinero.js';
import BaseTransformer from '@/transformers/BaseTransformer';
// eslint-disable-next-line import/no-cycle
import TransferTransformer from '@/transformers/TransferTransformer';

export default {
  makeInvoice(data: any) {
    return {
      ...BaseTransformer.makeBaseEntity(data),
      to: UserTransformer.makeUser(data.to),
      transfer: data.transfer ? TransferTransformer.makeTransfer(data.transfer) : null,
      invoiceEntries: data.invoiceEntries.map((entry: any) => this.makeInvoiceEntry(entry)),
      invoiceStatus: this.makeInvoiceStatus(data.currentState),
      addressee: data.addressee,
      description: data.description,
    } as Invoice;
  },

  makeInvoiceStatus(data: any) {
    return {
      ...BaseTransformer.makeBaseEntity(data),
      changedBy: UserTransformer.makeUser(data.changedBy),
      state: data.state,
    } as InvoiceStatus;
  },

  makeInvoiceEntry(data: any) {
    let price;

    if (typeof data.price === 'object') {
      if (data.price.amount !== undefined) {
        price = Dinero({ amount: Number(data.price.amount), currency: 'EUR' });
      } else {
        // This is to satisfy ESLint, yay
        const dineroPrice = data.price;
        price = dineroPrice;
      }
    } else {
      price = Dinero({ amount: Number(data.price), currency: 'EUR' });
    }

    return {
      ...BaseTransformer.makeBaseEntity(data),
      price,
      amount: data.amount,
      description: data.description,
    } as InvoiceEntry;
  },
};
