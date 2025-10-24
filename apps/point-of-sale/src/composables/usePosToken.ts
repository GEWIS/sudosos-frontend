import { computed, ref } from 'vue';

const posToken = ref<string | null>(localStorage.getItem('pos-token'));

export function usePosToken() {
  const hasPosToken = computed(() => posToken.value !== null);

  const setPosToken = (token: string) => {
    posToken.value = token;
    localStorage.setItem('pos-token', token);
  };

  const clearPosToken = () => {
    posToken.value = null;
    localStorage.removeItem('pos-token');
  };

  const getPosToken = () => posToken.value;

  return {
    hasPosToken,
    setPosToken,
    clearPosToken,
    getPosToken,
  };
}
