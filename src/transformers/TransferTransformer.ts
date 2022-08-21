import Dinero from 'dinero.js';
import { Transfer } from '@/entities/Transfer';
import BaseTransformer from '@/transformers/BaseTransformer';
import UserTransformer from '@/transformers/UserTransformer';
// eslint-disable-next-line import/no-cycle
import InvoiceTransformer from '@/transformers/InvoiceTransformer';
import StripeDepositTransformer from '@/transformers/StripeDepositTransformer';
import PayoutRequestTransformer from '@/transformers/PayoutRequestTransformer';

export default {
  makeTransfer(data: any): Transfer {
    return {
      ...BaseTransformer.makeBaseEntity(data),
      from: UserTransformer.makeUser(data.from),
      to: UserTransformer.makeUser(data.to),
      amount: Dinero(data.amount),
      description: data.description,
      invoice: data.invoice ? InvoiceTransformer.makeInvoice(data.invoice) : null,
      deposit: data.deposit ? StripeDepositTransformer.makeStripeDeposit(data.deposit) : null,
      payoutRequest: data.payoutRequest
        ? PayoutRequestTransformer.makePayoutRequest(data.payoutRequest) : null,
    };
  },
};
