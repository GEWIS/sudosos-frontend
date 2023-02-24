<template>
  <div>
    <Bar
      :chart-options="chartOptions"
      :chart-data="chartData"
      :chart-id="chartId"
      :dataset-id-key="datasetIdKey"
      :plugins="plugins"
      :css-classes="cssClasses"
      :styles="styles"
      :width="width"
      :height="height"
    />
    <b-button-group>
      <b-button @click="changeTimeScale('week')">Week</b-button>
      <b-button>Month</b-button>
      <b-button>Year</b-button>
    </b-button-group>
  </div>
</template>

<script>

import { Bar } from 'vue-chartjs/legacy';

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
export default {
  name: 'StatisticsChart',
  components: {
    Bar,
  },
  props: {
    chartId: {
      type: String,
      default: 'bar-chart',
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
      default: () => {},
    },
    plugins: {
      type: Array,
      default: () => [Title],
    },
    section: {
      type: String,
      default: 'consumed',
    },
    timeScale: [{
      type: String,
      default: 'year',
    }],
  },
  data() {
    return {
      loaded: false,
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Hello World!',
            align: 'start',
          },
        },
      },
    };
  },
  async created() {
    let labels;
    switch (this.timeScale) {
      case 'month':
        labels = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
        break;
      case 'week':
        labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        break;
      default:
        labels = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        break;
    }
    this.loaded = false;
    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Data One',
          backgroundColor: '#f87979',
          data: [40, 20, 12, 39, 10, 40, 39, 80, 40, 20, 12, 11],
        },
      ],
    };
    this.loaded = true;
  },
  methods: {
    changeTimeScale(scale) {
      // eslint-disable-next-line vue/no-mutating-props
      this.timeScale = scale;
    },
  },
};

</script>

<style scoped>

</style>
