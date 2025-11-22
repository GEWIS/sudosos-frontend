import { clearTokenInStorage, setupWebSocket, useAuthStore } from '@sudosos/sudosos-frontend-common';
import { jwtDecode } from 'jwt-decode';
import { BasePointOfSaleInfoResponse } from '@sudosos/sudosos-client';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { POS_TOKEN_KEY, usePosToken } from '@/composables/usePosToken';
import posApiService from '@/services/PosApiService';
import { userApiService } from '@/services/ApiService';
import { usePointOfSaleSwitch } from '@/composables/usePointOfSaleSwitch';

/**
 * Refreshes the POS authentication token and populates the POS store from the token.
 */
async function populatePosStoreFromToken(): Promise<boolean> {
  const posToken = usePosToken();
  if (!posToken.hasPosToken.value) return false;

  try {
    const res = await posApiService.authenticate.refreshToken();
    posToken.setPosToken(res.data.token);

    const decoded = jwtDecode<{ user: { pointOfSale: BasePointOfSaleInfoResponse } }>(res.data.token);
    const posId = decoded.user.pointOfSale.id;
    if (!posId) return false;

    const posStore = usePointOfSaleStore();
    await posStore.fetchPointOfSale(posId);
    return true;
  } catch (err) {
    console.error('Failed to refresh POS token:', err);
    throw err;
  }
}

export default async function beforeLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const posId = urlParams.get('posId');
  const apiKey = urlParams.get('apiKey');
  const userId = urlParams.get('userId');
  if (posId && apiKey && userId) {
    const authStore = useAuthStore();
    const { switchToPos } = usePointOfSaleSwitch();

    await authStore.apiKeyLogin(apiKey, Number(userId), userApiService);
   
    const pos = await userApiService.pos.getSinglePointOfSale(Number(posId));

    await switchToPos(pos.data);
  }

  try {
    setupWebSocket();
  } catch (e) {
    console.error(e);
    return;
  }
  await populatePosStoreFromToken()
    .then((res) => {
      if (!res) clearTokenInStorage(POS_TOKEN_KEY);
    })
    .catch(() => {
      clearTokenInStorage(POS_TOKEN_KEY);
    });
}
