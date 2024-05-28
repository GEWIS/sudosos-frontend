import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';

import App from './App.vue';
import router from './router';

import "./styles/themes/sudosos-light/theme.scss";
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { populateStoresFromToken } from "@sudosos/sudosos-frontend-common";
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css'; // Import PrimeIcons
import 'primeflex/primeflex.css';
import apiService from './services/ApiService';
import i18n from './utils/i18nUtils';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

const app = createApp(App);

app.use(i18n);
app.use(createPinia());
app.use(router);

app.use(PrimeVue);

app.use(ToastService);

app.directive('tooltip', Tooltip);

populateStoresFromToken(apiService);
app.mount('#app');