import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class Formatters extends Vue {
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

  /*
    Parses times such that each value has a padded 0 if < 10
   */
  public parseTime = (value: number): string => (value < 10 ? '0' : '') + value;
}
