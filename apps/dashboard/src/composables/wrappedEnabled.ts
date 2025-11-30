import { computed } from 'vue';
import { isAllowed } from '@sudosos/sudosos-frontend-common';

export function useWrappedEnabled() {
  const override = isAllowed('override', ['all'], 'Wrapped', ['*']);

  return {
    wrappedEnabled: computed(() => true), // TODO: replace with actual state when available
    canOverride: computed(() => override),
  };
}
