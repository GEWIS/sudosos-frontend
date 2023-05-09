<template>
  <div>
    <Pie
      :chart-options="chartOptions"
      :chart-data="chartData"
      :chart-id="chartId"
      :dataset-id-key="datasetIdKey"
      :plugins="plugins"
      :styles="styles"
      :width="width"
      :height="height"
    />
  </div>
</template>

<script>

import { Pie } from 'vue-chartjs/legacy';

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);
export default {
  name: 'MostBoughtChart',
  components: {
    Pie,
  },
  props: {
    chartId: {
      type: String,
      default: 'pie-chart',
    },
    datasetIdKey: {
      type: String,
      default: 'label',
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 400,
    },
    cssClasses: {
      default: '',
      type: String,
    },
    styles: {
      type: Object,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {
      },
    },
    plugins: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            font: {
              size: 30,
              family: 'Raleway, sans-serif',
              weight: '500',
            },
            text: 'Most bought products',
            align: 'center',
          },
        },
      },
      chartData: {
        labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
        datasets: [
          {
            backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
            data: [40, 20, 80, 10],
          },
        ],
      },
    };
  },
};
</script>

<style scoped>

</style>
