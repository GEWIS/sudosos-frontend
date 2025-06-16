import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const SudososPreset = definePreset(Aura, {
  cssLayer: {
    name: 'primevue',
    order: 'theme, base, primevue',
  },
  components: {
    menubar: {
      root: {
        borderColor: 'none',
        background: '{primary.color}',
      },
      item: {
        color: '{primary.inverseColor}',
        focusBackground: '{primary.color}',
        activeBackground: '{primary.color}',
        focusColor: '{primary.inverseColor}',
        activeColor: '{primary.inverseColor}',
        icon: {
          color: '{primary.inverseColor}',
        },
      },
      submenu: {
        background: '{primary.color}',
        borderColor: '{primary.activeColor}',
        icon: {
          color: '{primary.inverseColor}',
        },
      },
      mobileButton: {
        color: '{primary.inverseColor}',
      },
      colorScheme: {
        light: {
          root: {
            borderColor: 'none',
            background: '{primary.color}',
          },
        },
      },
    },
  },
});
