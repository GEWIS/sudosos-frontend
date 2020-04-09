import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class Formatters extends Vue {
  formatDateTime(date: Date, full: Boolean) : string {
    const weekDays: String[] = [
      this.$t('transactionsComponent.Monday').toString(),
      this.$t('transactionsComponent.Tuesday').toString(),
      this.$t('transactionsComponent.Wednesday').toString(),
      this.$t('transactionsComponent.Thursday').toString(),
      this.$t('transactionsComponent.Friday').toString(),
      this.$t('transactionsComponent.Saturday').toString(),
      this.$t('transactionsComponent.Sunday').toString(),
    ];

    if (full) {
      return `${this.parseTime(date.getDate())}-`
        + `${this.parseTime(date.getMonth() + 1)}-`
        + `${date.getFullYear()} (${weekDays[date.getDay()]})`;
    }

    return `${this.parseTime(date.getHours())}:`
      + `${this.parseTime(date.getMinutes())}`;
  }

  /*
    Parses times such that each value has a padded 0 if < 10
   */
  public parseTime = (value: number): string => (value < 10 ? '0' : '') + value;
}
