import { clearTokenInStorage, setupWebSocket } from '@sudosos/sudosos-frontend-common';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { POS_TOKEN_KEY, POS_ID_KEY, usePosToken } from '@/composables/usePosToken';
import posApiService from '@/services/PosApiService';

/**
 * Populates the POS store from localStorage.
 * TODO: Remove this localStorage workaround once backend includes a reference to the posId in POS JWT token.
 * Since the POS JWT token's user.id is not the same as the POS ID, so we store it separately.
 */
async function populatePosStoreFromToken() {
  const posToken = usePosToken();
  const isPosAuth = posToken.hasPosToken.value;
  await posApiService.authenticate.refreshToken().then((res) => {
    posToken.setPosToken(res.data.token);
  });

  if (isPosAuth) {
    const posIdStr = localStorage.getItem(POS_ID_KEY);
    if (posIdStr) {
      const posId = Number.parseInt(posIdStr, 10);
      if (!Number.isNaN(posId)) {
        const posStore = usePointOfSaleStore();
        await posStore.fetchPointOfSale(posId);
      }
    }
  }
}

export default async function beforeLoad() {
  try {
    setupWebSocket();
  } catch (e) {
    console.error(e);
    return;
  }
  await populatePosStoreFromToken().catch(() => {
    clearTokenInStorage(POS_TOKEN_KEY);
  });
}
