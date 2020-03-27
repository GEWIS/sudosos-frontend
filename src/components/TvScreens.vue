<template>
<div>
  <b-card>
    <b-card-title>
      <b-form-row>
        <b-col xl="6" sm="12" cols="12" class="mb-2 mb-xl-0">
          <b-form-group
            id="time"
            label="Eindtijd"
            label-cols="4">
            <b-form-timepicker
              id="end-time"
              v-model="endTimeString"
              locale="en-NL">
            </b-form-timepicker>
          </b-form-group>
        </b-col>
        <b-col xl="6" sm="12" cols="12" class="mb-2 mb-xl-0">
          <b-button
            variant="primary"
            id="confirmBorrelModeTime"
            v-on:click="confirmBorrelModeTime">
            Bevestig eindtijd
          </b-button>
          <b-button
            variant="primary"
            id="stopBorrelMode"
            v-on:click="stopBorrelMode"
            v-if="enabled">
            Borrel modus uitschakelen
          </b-button>
        </b-col>
      </b-form-row>
    </b-card-title>
    <b-card-body>
      <p v-if="enabled">Borrel modus op de TV schermen staat momenteel
        <span class="body-mode-enabled">AAN</span>. Borrel modus wordt vanzelf uitgeschakeld om
        {{ endTime.toLocaleString() }}. Je kunt de tijd bovenin veranderen of borrel modus
        vroegtijdig beëindigen door op "Borrel modus uitschakelen" te klikken.
      </p>
      <p v-if="!enabled">Borrel modus op de TV schermen staat momenteel
        <span class="body-mode-disabled">UIT</span>. Je kunt borrel modus aanzetten door bovenin een
        tijd te kiezen. Op deze tijd wordt borrel modus weer uitgeschakeld.
      </p>
    </b-card-body>
  </b-card>
</div>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';

function fetchTvScreensBorrelModeEndTime(): Date | null {
  if (false) {
    return new Date();
  }
  return null;
}

function parseTimeStringToFutureDate(value: string): Date {
  // Parse the time string to integers and get the current date and time
  const hour = parseInt(value.substring(0, 2), 10);
  const minute = parseInt(value.substring(3, 5), 10);
  const second = parseInt(value.substring(6, 8), 10);
  const now = new Date();

  // If the given time is smaller than the current time...
  if (hour < now.getHours()
    || (hour === now.getHours() && minute < now.getMinutes())
    || (hour === now.getHours() && minute === now.getMinutes() && second < now.getSeconds())) {
    // Return a date object with the given time for tomorrow
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hour, minute,
      second);
  }
  // Return a date object with the given time for today
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, second);
}

@Component
export default class TvScreens extends Vue {
  endTime: Date | null = null;

  endTimeString: string = '';

  enabled: boolean = false;

  beforeMount() {
    this.endTime = fetchTvScreensBorrelModeEndTime();
    if (this.endTime !== null) {
      this.endTimeString = `${this.endTime.getHours()}:${this.endTime.getMinutes()}:${this.endTime.getSeconds()}`;
      this.enabled = true;
    }
  }

  confirmBorrelModeTime() {
    this.endTime = parseTimeStringToFutureDate(this.endTimeString);
    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(this.endTime.getTime())) {
      this.enabled = true;
      // Send data to server
    }
  }

  stopBorrelMode() {
    console.log(this.enabled);
    this.enabled = false;
    console.log(this.enabled);
    this.endTimeString = '';
  }

  /* @Watch('endTimeString')
  onEndTimeStringChanged(value: string, old: string): void {
    if (value !== '') {
      this.endTime = parseTimeStringToFutureDate(value);
      this.enabled = true;
    }
  } */
}
</script>

<style scoped lang="scss">
  @import "~bootstrap/scss/bootstrap";
  @import './src/styles/Card.scss';

  .body-mode-disabled {
    color: red;
    font-weight: bold;
  }

  .body-mode-enabled {
    color: green;
    font-weight: bold;
  }

  button {
    margin-left: 0.25rem;
    margin-right: 0.25rem;
  }

  @include media-breakpoint-down(sm) {
    button {
      margin-top: 0.25rem;
      margin-bottom: 0.25rem;
    }
  }

</style>
