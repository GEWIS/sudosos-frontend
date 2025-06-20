import { definePreset } from '@primeuix/themes';
import { SudososPreset } from '../sudosos';

export const SudososRed = definePreset(SudososPreset, {
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
        primary: {
          color: '#D40000',
          inverseColor: '#ffffff',
          hoverColor: '#C40000',
          activeColor: '#D40000',
        },
        highlight: {
          background: 'rgba(0,0,0,0)',
          focusBackground: 'rgba(0,0,0,0)',
          color: '#D40000',
          focusColor: '#C40000',
        },
        // content: {
        //   background: '{zinc.50}',
        //   color: '#000000'
        // }
      },
      dark: {
        primary: {
          color: '#D40000',
          inverseColor: '#ffffff',
          hoverColor: '#C40000',
          activeColor: '#D40000',
        },
        highlight: {
          background: 'rgba(0,0,0,0)',
          focusBackground: 'rgba(0,0,0,0)',
          color: '#D40000',
          focusColor: '#C40000',
        },
      },
    },
  },
});
