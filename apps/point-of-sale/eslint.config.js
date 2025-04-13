import { defineConfig } from 'eslint/config';
import { eslintConfig as common } from '@gewis/eslint-config-typescript';
import { eslintConfig as vue } from '@gewis/eslint-config-vue';
import { eslintConfig as prettier } from '@gewis/prettier-config';

export default defineConfig([
  {
    extends: [common, vue, prettier],
  },
]);
