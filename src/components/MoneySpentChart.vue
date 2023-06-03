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
      <b-button @click="changeTimeScale('month')">Month</b-button>
      <b-button @click="changeTimeScale('year')">Year</b-button>
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
import { getModule } from 'vuex-module-decorators';
import UserModule from '@/store/modules/user';
import { getDatasets, StatisticsHelper } from '@/api/statistics';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'MoneySpentChart',
  components: {
    Bar,
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
            font: {
              size: 30,
              family: 'Raleway, sans-serif',
              weight: '500',
            },
            text: 'Money Spent',
            align: 'start',
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
      timeScale: 'year',
    };
  },
  async mounted() {
    await this.fetchData();
  },
  watch: {
    timeScale: {
      handler: 'fetchData',
      immediate: true,
    },
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
      default: () => ({}),
    },
    plugins: {
      type: Array,
      default: () => [Title],
    },
    section: {
      type: String,
      default: 'consumed',
    },
  },
  methods: {
    async fetchData() {
      this.loaded = false;
      const userState = getModule(UserModule);
      await userState.fetchSelf(true);
      const userID = userState.self.id;
      const datasets = await getDatasets(this.timeScale, userID);
      const statHelper = new StatisticsHelper(userID);
      await statHelper.init();
      console.log(statHelper.getStatistics(new Date(), new Date(2023, 6, 4)));
      /* const datasets = [
        {
          label: userID,
          backgroundColor: '#f87979',
          data: dataset,
        },
      ]; */
      let labels;
      switch (this.timeScale) {
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
        case 'week':
          labels = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ];
          break;
        case 'month':
          labels = Array.from({ length: 31 }, (_, index) => index + 1);
          break;
      }
      this.chartData = {
        labels,
        datasets,
      };
      this.loaded = true;
    },
    changeTimeScale(scale) {
      this.timeScale = scale;
    },
  },
};
</script>

<style scoped>

</style>
