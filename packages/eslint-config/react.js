import base from "./index.js";
import react from "@eslint-react/eslint-plugin";
import { fixupPluginRules } from "@eslint/compat";
import reactHooks from "eslint-plugin-react-hooks/index.js";
import tseslint from "typescript-eslint";

export default tseslint.config(...base, react.configs.recommended, {
  plugins: {
    "react-hooks": fixupPluginRules(reactHooks),
  },
  rules: reactHooks.configs.recommended.rules,
});
