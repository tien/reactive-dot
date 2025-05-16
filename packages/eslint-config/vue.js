import base from "./index.js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...base,
  ...pluginVue.configs["flat/recommended"],
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        sourceType: "module",
        parser: "@typescript-eslint/parser",
        globals: {
          ...globals.browser,
        },
      },
    },
  },
);
