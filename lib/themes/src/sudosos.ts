import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const SudososPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}',
    },
    colorScheme: {
      light: {
        highlight: {
          background: 'rgba(0,0,0,0)',
          color: '{color.primary}',
        },
        content: {
          background: '{zinc.50}',
          color: '#000000',
        },
        extend: {
          body: {
            background: '{surface.0}',
          },
        },
      },
      dark: {
        highlight: {
          background: 'rgba(0,0,0,0)',
          color: '{color.primary}',
        },
        extend: {
          body: {
            background: '{surface.950}',
          },
        },
      },
    },
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
        borderColor: '{primary.inverseColor}',
        icon: {
          color: '{primary.inverseColor}',
        },
      },
      mobileButton: {
        color: '{primary.inverseColor}',
      },
    },
  },
});
