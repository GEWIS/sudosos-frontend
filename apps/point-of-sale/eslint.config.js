import { defineConfig } from "eslint/config";
// Very ironic, but without the extensions eslint does not work
// eslint-disable-next-line import/extensions
import root from "../../eslint.config.js";

export default defineConfig([
  {
    extends: [...root]
  },
]);
