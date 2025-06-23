import { ref, onMounted } from 'vue';

const DARK_MODE_KEY = 'dark-mode';

/**
 * Composable for managing dark mode
 * @returns {Object} Object containing the isDark, toggle, enable and disable functions
 */
export function useDarkMode() {
  const isDark = ref(false);

  const apply = (value: boolean) => {
    isDark.value = value;
    const html = document.documentElement;
    html.classList.toggle('dark-mode', value);
    localStorage.setItem(DARK_MODE_KEY, value ? 'true' : 'false');
  };

  const toggle = () => apply(!isDark.value);

  onMounted(() => {
    apply(localStorage.getItem(DARK_MODE_KEY) === 'true');
  });

  return {
    isDark,
    toggle,
    enable: () => apply(true),
    disable: () => apply(false),
  };
}
