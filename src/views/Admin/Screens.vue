<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('screens.Screens') }}</h1>
    <b-card>
      <b-card-title>
        <b-form-row>
          <b-col xl="6" sm="12" cols="12" class="mb-2 mb-xl-0">
            <b-form-group
              id="time"
              :label="$t('screens.Ending time')"
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
              class="mx-1 my-1 my-sm-0"
              v-on:click="confirmBorrelModeTime">
              {{ $t('screens.Confirm end time') }}
            </b-button>
            <b-button
              variant="primary"
              id="stopBorrelMode"
              class="mx-1 my-1 my-sm-0"
              v-on:click="stopBorrelMode"
              v-if="enabled">
              {{ $t('screens.Stop social drink mode') }}
            </b-button>
          </b-col>
        </b-form-row>
      </b-card-title>
      <b-card-body>
        <p v-if="enabled">
          {{ $t('screens.currently')}}
          <span class="body-mode-enabled">{{ $t('screens.on') }}</span>.
          {{ $t('screens.turn off') }}
          {{ endTime.toLocaleString('en-NL').replace(/\//g, '-') }}.
          {{ $t('screens.early') }}
        </p>
        <p v-if="!enabled">
          {{ $t('screens.currently')}}
          <span class="body-mode-disabled">{{ $t('screens.off') }}</span>.
          {{ $t('screens.turn on') }}
        </p>
      </b-card-body>
    </b-card>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

  @Component
export default class Screens extends Vue {
    endTime: Date | null = null;

    endTimeString: string = '';

    enabled: boolean = false;

    beforeMount() {
      this.endTime = this.fetchTvScreensBorrelModeEndTime();
      if (this.endTime !== null) {
        this.endTimeString = `${this.endTime.getHours()}:`
          + `${this.endTime.getMinutes()}:`
          + `${this.endTime.getSeconds()}`;
        this.enabled = true;
      }
    }

    confirmBorrelModeTime() {
      this.endTime = this.parseTimeStringToFutureDate(this.endTimeString);
      if (!Number.isNaN(this.endTime.getTime())) {
        this.enabled = true;
        // Send data to server
      }
    }

    stopBorrelMode() {
      this.enabled = false;
      this.endTimeString = '';
    }

    fetchTvScreensBorrelModeEndTime = (): Date | null => null;
    // {
    //   if (false) {
    //     return new Date();
    //   }
    //   return null;
    // }

    parseTimeStringToFutureDate = (value: string): Date => {
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
    };
}
</script>

<style scoped lang="scss">
</style>
