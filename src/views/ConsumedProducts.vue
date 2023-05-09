<template>
  <b-container fluid="lg" style="display: flex; flex-direction: column">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">Statistics</h1>
    <MoneySpentChart  />
    <div style="display: flex; flex-direction: row"><MostBoughtChart /></div>
  </b-container>
</template>

<script>
import MoneySpentChart from '@/components/MoneySpentChart.vue';
import MostBoughtChart from '@/components/MostBoughtChart.vue';

export default {
  name: 'ConsumedProducts',
  components: {
    MoneySpentChart,
    MostBoughtChart,
  },
};
</script>

<style lang="scss" scoped>

</style>
