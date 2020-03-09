import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
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
  faCheck,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import App from './App.vue';
import router from './router';
import store from './store';

// Import bootstrap js
import 'bootstrap';

// Import the BootstrapVue style
import './styles/global/_main.scss';

library.add(
  faCoffee,
  faChild,
  faCircle,
  faArchive,
  faCheckCircle,
  faPencilAlt,
  faTimes,
  faPlus,
  faCheck,
  faInfoCircle,
);

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('font-awesome-layers', FontAwesomeLayers);
Vue.component('font-awesome-layers-text', FontAwesomeLayersText);

Vue.use(BootstrapVue);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
