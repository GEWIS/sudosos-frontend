import Vue from 'vue';
import Component from 'vue-class-component';
import dinero from 'dinero.js';
import { Transaction } from '@/entities/Transaction';

@Component
export default class Formatters extends Vue {
  /**
   * Can format date object into multiple time formats depending on what parameters you set if none
   * are set just the time in format `hh:mm`
   *
   * @param date Date object that needs to be properly formatted
   * @param full If you need a full return date `dd-mm-yyyy (dddd)`
   * @param partial If you need a partial full date with time `dd-mm-yyyy hh:mm`
   * @returns string with formatted date
   */
  formatDateTime(date: Date,
    full?: Boolean,
    partial?: Boolean) : string {
    const weekDays: String[] = [
      this.$t('formatters.Monday').toString(),
      this.$t('formatters.Tuesday').toString(),
      this.$t('formatters.Wednesday').toString(),
      this.$t('formatters.Thursday').toString(),
      this.$t('formatters.Friday').toString(),
      this.$t('formatters.Saturday').toString(),
      this.$t('formatters.Sunday').toString(),
    ];

    if (full) {
      return `${this.parseTime(date.getDate())}-`
        + `${this.parseTime(date.getMonth() + 1)}-`
        + `${date.getFullYear()} (${weekDays[date.getDay()]})`;
    }

    if (partial) {
      return `${this.parseTime(date.getDate())}-`
        + `${this.parseTime(date.getMonth() + 1)}-`
        + `${date.getFullYear()} - `
        + `${this.parseTime(date.getHours())}:`
        + `${this.parseTime(date.getMinutes())}`;
    }

    return `${this.parseTime(date.getHours())}:`
      + `${this.parseTime(date.getMinutes())}`;
  }

  /**
   * Parses times such that each value has a padded 0 if < 10
   */
  public parseTime = (value: number): string => (value < 10 ? '0' : '') + value;

  /**
   * Function to make dinero usable in the template
  */
  dinero: Function = dinero;

  /**
   * Function that returns a translated value, this is needed for the table headers to function
   * correctly
   *
   * @param translation String that needs to be translated
   */
  public getTranslation(translation: string): string {
    return <string> this.$t(translation);
  }

  /**
   * This method will simply update the translations in the field array. The field should contain
   * objects that at least have keys `label` and `locale_key`. It will then set label to a new
   * translation
   *
   * @param fields fields that need to be processed
   * @param base base key that can be used for grabbing correct translations
   */
  public updateTranslations(fields: Object[], base: string): Object[] {
    const updatedFields: any = [];

    fields.forEach((field, index) => {
      // This is ugly but needs to be done for typescript
      const fieldHack: any = field;
      fieldHack.label = this.$t(`${base}.${fieldHack.locale_key}`);
      updatedFields.push(fieldHack);
    });

    return updatedFields;
  }

  /**
   * formatTransactions add rows for each date and formats the dates into a nicer format that we
   * want to use for displaying the dates
   *
   * @param t List of transactions
   *
   */
  public formatTransactions: Function = (t: Transaction[]) => {
    const dates: String[] = [];

    let transactions: Transaction[] = [];
    let dateTransactions: Transaction[] = [];
    let dateRowTransaction: Transaction = {} as Transaction;
    t.forEach((transaction) => {
      // Create formatted date and time for each transaction
      const fDate = this.formatDateTime(transaction.createdAt, true);
      const time = this.formatDateTime(transaction.createdAt);

      // If formatted date has not been used yet make a date row
      if (!dates.find(d => d === fDate) || '') {
        dates.push(fDate);

        // If this is the second date row we found push the first one and add the transactions
        // that occurred on that date
        if (dates.length > 1) {
          transactions.push(dateRowTransaction);
          transactions = transactions.concat(dateTransactions);
          dateTransactions = [];
        }

        dateRowTransaction = {
          id: fDate,
          soldToId: '',
          authorized: '',
          totalPrice: 0,
          pointOfSale: '',
          activityId: '',
          subTransactions: [],
          comment: '',
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
          formattedDate: fDate,
        } as Transaction;
      }

      // Add all the needed information to the dateRow transaction from the transactions beneath
      // it. This makes sure the filter function can correctly keep the dateRows in the
      // transaction table
      const trans: Transaction = transaction;
      trans.formattedDate = time;
      dateRowTransaction.soldToId = `${dateRowTransaction.soldToId} ${transaction.soldToId}`;
      dateRowTransaction.authorized = `${dateRowTransaction.authorized} ${transaction.authorized}`;
      dateRowTransaction.activityId = `${dateRowTransaction.activityId} ${transaction.activityId}`;

      dateTransactions.push(trans);
    });

    // Push the last dateRow transaction and transactions that accompany it
    if (dateRowTransaction.activityId !== '') {
      transactions.push(dateRowTransaction);
      transactions = transactions.concat(dateTransactions);
    }

    return transactions;
  };
}
