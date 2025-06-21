import { definePreset } from '@primeuix/themes';
import { SudososPreset } from '../sudosos';

export const SudososGreen = definePreset(SudososPreset, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '#409d1f',
          inverseColor: '#ffffff',
          hoverColor: '#35831a',
          activeColor: '#409d1f',
        },
      },
      dark: {
        primary: {
          color: '#409d1f',
          inverseColor: '#ffffff',
          contrastColor: '#ffffff',
          hoverColor: '#35831a',
          activeColor: '#409d1f',
        },
      },
    },
  },
  components: {
    menubar: {
      colorScheme: {
        dark: {
          root: {
            background: '#35831a',
          },
        },
      },
    },
  },
});
