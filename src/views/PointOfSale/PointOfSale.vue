<template>
  <b-container fluid="md">
    <h1>Point of sale page</h1>
    <POSOverview/>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import POSOverview from '@/components/POSOverview.vue';

@Component({
  components: { POSOverview },
})

export default class PointOfSale extends Vue {
}
</script>

<style lang="scss" scoped>

</style>
