import { Dinero } from 'dinero.js';

export interface Balance {
  balance: Dinero;
  fine: Dinero;
  fineSince: Date;
}
