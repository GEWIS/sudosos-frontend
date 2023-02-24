<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">Statistics</h1>
    <StatisticsChart  />

  </b-container>
</template>

<script>
import StatisticsChart from '@/components/StatisticsChart.vue';

export default {
  name: 'ConsumedProducts',
  components: {
    StatisticsChart,
  },
};
</script>

<style lang="scss" scoped>

</style>
