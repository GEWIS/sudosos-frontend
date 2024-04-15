/* eslint vue/multi-word-component-names: 0 */
/* eslint vue/no-reserved-component-names: 0 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';

import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';
import Button from "primevue/button";
import "./styles/themes/sudosos-light/theme.scss";
import InputText from "primevue/inputtext";
import Menubar from "primevue/menubar";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import InputNumber from "primevue/inputnumber";
import Dialog from "primevue/dialog";
import 'primeicons/primeicons.css';
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import TabView from "primevue/tabview";
import ScrollPanel from "primevue/scrollpanel";
import FileUpload from "primevue/fileupload";
import 'primeflex/primeflex.css';
import { populateStoresFromToken } from "@sudosos/sudosos-frontend-common";
import en from "./locales/en.json";
import nl from "./locales/nl.json";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css'; // Import PrimeIcons

import 'primeflex/primeflex.css';
import apiService from './services/ApiService';
import Accordion from "primevue/accordion";
import Skeleton from "primevue/skeleton";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
const app = createApp(App);


const i18n = createI18n({
    locale: localStorage.getItem('locale') || 'en',
    fallbackLocale: 'en',
    legacy: false,
    globalInjection: true,
    messages: {
        en,
        nl
    },
});
app.use(createPinia());
app.use(router);
app.use(PrimeVue);
app.use(i18n);
app.use(ToastService);

app.component('Button', Button);
app.component('InputText', InputText);
app.component('Menubar', Menubar);
app.component('Panel', Panel);
app.component('DataTable', DataTable);
app.component('InputNumber', InputNumber);
app.component('Dialog', Dialog);
app.component('Dropdown', Dropdown);
app.component('Checkbox', Checkbox);
app.component('TabView', TabView);
app.component('ScrollPanel', ScrollPanel);
app.component('FileUpload', FileUpload);
app.component('Toast', Toast);
app.component('Accordion', Accordion);
app.component('Skeleton', Skeleton);
app.component('InputIcon', InputIcon);
app.component('IconField', IconField);

populateStoresFromToken(apiService);
app.mount('#app');
