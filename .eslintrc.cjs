module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true
  },
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "import"
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts"]
      },
      typescript: {
        project: "./tsconfig.json"
      }
    }
  },
  rules: {
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "import/order": ["warn", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always",
      "alphabetize": { "order": "asc", "caseInsensitive": true }
    }]
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    "coverage/",
    "test-results/"
  ]
};
