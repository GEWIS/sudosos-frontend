import Vue from 'vue';
import Component from 'vue-class-component';
import dinero from 'dinero.js';

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
}
