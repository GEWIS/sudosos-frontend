import Vue from 'vue';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import dinero, { Currency } from 'dinero.js';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText } from '@fortawesome/vue-fontawesome';
import {
  faCoffee,
  faChild,
  faCircle,
  faArchive,
  faCheckCircle,
  faPencilAlt,
  faTimes,
  faPlus,
  faInfoCircle,
  faChevronLeft,
  faChevronRight,
  faTimesCircle,
  faFileExport,
  faAngleUp,
  faAngleDown,
  faPenAlt,
  faGlobeEurope,
  faCheck,
  faQuestion,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import vSelect from 'vue-select';
import { StripePlugin } from '@vue-stripe/vue-stripe';
import App from './App.vue';
import router from './router';
import store from './store';
import languages from './locales/index';

import 'vue-select/dist/vue-select.css';

// Import the BootstrapVue style
import './styles/global/_main.scss';

library.add(
  faCoffee,
  faChild,
  faCircle,
  faCheck,
  faArchive,
  faCheckCircle,
  faPencilAlt,
  faTimes,
  faPlus,
  faCheck,
  faInfoCircle,
  faChevronLeft,
  faChevronRight,
  faTimesCircle,
  faFileExport,
  faAngleUp,
  faAngleDown,
  faPenAlt,
  faTrash,
  faGlobeEurope,
  faQuestion,
);

// Default settings for Dinero
dinero.defaultCurrency = 'EUR' as Currency;
dinero.defaultPrecision = 2;

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('font-awesome-layers', FontAwesomeLayers);
Vue.component('font-awesome-layers-text', FontAwesomeLayersText);
Vue.component('v-select', vSelect);

Vue.use(VueI18n);
Vue.use(BootstrapVue);

const messages = Object.assign(languages);

const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});

Vue.config.productionTip = false;
Vue.config.devtools = true;

const options = {
  pk: 'pk_test_51L2gp5Dc07FvE4beZcK9p6086vtUEtemNfBntoGXoeKDWRLdmgRp4aighjD8R6b9e4hsNiucz7sNXhB6XEEL2IUy00LPiofvlm',
  // stripeAccount: process.env.STRIPE_ACCOUNT,
  // apiVersion: process.env.API_VERSION,
  // locale: process.env.LOCALE,
};

Vue.use(StripePlugin, options);

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
