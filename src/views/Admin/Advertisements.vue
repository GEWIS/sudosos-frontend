<template>
  <b-container fluid="md">
    <h1>Advertisements page</h1>
    <AdvertisementsList></AdvertisementsList>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import AdvertisementsList from '@/components/AdvertisementsList.vue';

  @Component({
    components: {
      AdvertisementsList,
    },
  })

export default class Advertisements extends Vue {
}
</script>

<style lang="scss" scoped>

</style>
