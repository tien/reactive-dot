import base from "./index.js";
import { fixupPluginRules, fixupConfigRules } from "@eslint/compat";
import reactHooks from "eslint-plugin-react-hooks/index.js";
import reactJsxRuntime from "eslint-plugin-react/configs/jsx-runtime.js";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...base,
  ...fixupConfigRules(reactRecommended),
  {
    languageOptions: reactJsxRuntime.languageOptions,
    rules: reactJsxRuntime.rules,
  },
  {
    plugins: {
      "react-hooks": fixupPluginRules(reactHooks),
    },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/display-name": "off",
      "react/no-unescaped-entities": "off",
      "react/no-unknown-property": ["error", { ignore: ["css"] }],
    },
  },
);
