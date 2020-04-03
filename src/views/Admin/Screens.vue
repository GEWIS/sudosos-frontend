<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('screens.Screens') }}</h1>
    <TvScreens></TvScreens>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TvScreens from '@/components/TvScreens.vue';

  @Component({
    components: {
      TvScreens,
    },
  })

export default class Screens extends Vue {
}
</script>

<style scoped lang="scss">
</style>
