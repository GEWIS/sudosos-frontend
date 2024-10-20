import { useSettingsStore } from '@/stores/settings.store';
import { populateStoresFromToken } from '@sudosos/sudosos-frontend-common';
import apiService from '@/services/ApiService';

export default async function beforeLoad() {

  const settingsStore = useSettingsStore();
  await settingsStore.fetchMaintenanceMode();

  await populateStoresFromToken(apiService);
}