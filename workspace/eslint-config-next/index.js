const nextPlugin = require("@next/eslint-plugin-next");
const reactPlugin = require("eslint-plugin-react");
const hooksPlugin = require("eslint-plugin-react-hooks");

module.exports = [
  {
    ignores: ["**/dist/*", "**/.next/*", "*.config.{mjs,js,ts}"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: require("@typescript-eslint/eslint-plugin").configs.recommended.rules,
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
    },
  },
  {
    plugins: {
      "simple-import-sort": require("eslint-plugin-simple-import-sort"),
      import: require("eslint-plugin-import"),
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
    },
  },
  {
    files: ["app/**/*", "components/**/*"],
    plugins: {
      react: reactPlugin,
      "react-hooks": hooksPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...hooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@next/next/no-img-element": "error",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  require("eslint-config-prettier"),
];
