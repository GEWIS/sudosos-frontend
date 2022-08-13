import Vue from 'vue';
import Component from 'vue-class-component';
import dinero from 'dinero.js';
import { Transaction } from '@/entities/Transaction';
import { Transfer } from '@/entities/Transfer';
import { getModule } from 'vuex-module-decorators';
import UserModule from '@/store/modules/user';

function byYou(trans: Transaction, id: number) {
  return trans.createdBy.id === id;
}

function forYou(trans: Transaction, id: number) {
  return trans.from.id === id;
}

function samePerson(trans: Transaction) {
  return trans.from.id === trans.createdBy.id;
}

@Component
export default class Formatters extends Vue {
  userState = getModule(UserModule);

  beforeMount() {
    this.userState.fetchUser();
  }

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
      this.$t('formatters.Sunday').toString(),
      this.$t('formatters.Monday').toString(),
      this.$t('formatters.Tuesday').toString(),
      this.$t('formatters.Wednesday').toString(),
      this.$t('formatters.Thursday').toString(),
      this.$t('formatters.Friday').toString(),
      this.$t('formatters.Saturday').toString(),
    ];

    const parseDate = new Date(date);

    if (parseDate === undefined) {
      return '';
    }

    if (full) {
      return `${this.parseTime(parseDate.getDate())}-`
        + `${this.parseTime(parseDate.getMonth() + 1)}-`
        + `${parseDate.getFullYear()} (${weekDays[parseDate.getDay()]})`;
    }

    if (partial) {
      return `${this.parseTime(parseDate.getDate())}-`
        + `${this.parseTime(parseDate.getMonth() + 1)}-`
        + `${parseDate.getFullYear()} - `
        + `${this.parseTime(parseDate.getHours())}:`
        + `${this.parseTime(parseDate.getMinutes())}`;
    }

    return `${this.parseTime(parseDate.getHours())}:`
      + `${this.parseTime(parseDate.getMinutes())}`;
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
   * Give every word in a sentence a capital letter
   *
   * @param {string} sentence: the sentence we want to have a capital letter
   * @return {string}: the sentence with a capital letter before each word
   */
  // eslint-disable-next-line class-methods-use-this
  public setCapitalLetter(sentence: string): string {
    let words = sentence.split(' ');
    words = words.map((wrd) => wrd[0].toUpperCase() + wrd.substring(1));
    return words.join(' ');
  }

  /**
   * Given a set of arrays as parameters, combines all the arrays that are non-null
   *
   * @param {any} arrays: a set of multiple arrays
   * @return {any[]}: A combined array of all non-null arrays that were given as parameters
   */
  // eslint-disable-next-line class-methods-use-this
  concat(...arrays: any) {
    return [].concat(...arrays.filter(Array.isArray));
  }

  /**
   * Sets the correct translation for what happened with the transaction
   *
   * @param {Transaction} trans : Transaction or transfer that we need description for
   */
  setDescription(trans: Transaction | Transfer) {
    const { id } = this.userState.self;
    // We have a transactions
    if ('pointOfSale' in trans) {
      // This is a transaction put in for someone else
      if (byYou(trans, id)) {
        if (forYou(trans, id)) {
          return this.$t('c_transactionsTable.transaction', { person: this.$t('c_transactionsTable.You'), amount: trans.price.toFormat() });
        }
        return this.$t('c_transactionsTable.transactionPutFor', { person: this.$t('c_transactionsTable.You'), name: trans.from.firstname, amount: trans.price.toFormat() });
      }
      if (forYou(trans, id)) {
        return this.$t('c_transactionsTable.transactionPutFor', { person: trans.createdBy.firstname, name: this.$t('c_transactionsTable.You'), amount: trans.price.toFormat() });
      }
      if (samePerson(trans)) {
        return this.$t('c_transactionsTable.transaction', { person: trans.from.firstname, amount: trans.price.toFormat() });
      }
      return this.$t('c_transactionsTable.transactionPutFor', { person: trans.createdBy.firstname, name: trans.from.firstname, amount: trans.price.toFormat() });
    }

    // This is a transfer
    if (trans.description !== undefined && trans.description.length > 0) {
      if (trans.to.id === id) return this.$t('c_transactionsTable.transfer', { person: this.$t('c_transactionsTable.You'), amount: trans.amount.toFormat() });
      return this.$t('c_transactionsTable.transfer', { person: trans.to.firstname, amount: trans.amount.toFormat() });
      // return trans.description;
    }

    return this.$t('c_recentTransactionsTable.transfer', { amount: trans.amount.toFormat() });
  }
}
