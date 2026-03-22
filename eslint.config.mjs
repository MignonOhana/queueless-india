import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import security from "eslint-plugin-security";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  security.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "react-hooks/exhaustive-deps": "warn",
      "security/detect-object-injection": "off", // Too noisy for basic object lookups
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-process-env": "off", // Necessary for Next.js env access
      "react/no-unescaped-entities": "warn",
      "prefer-const": "warn",
      "@typescript-eslint/no-require-imports": "warn"
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
