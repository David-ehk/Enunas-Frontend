import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next v16 ships native flat configs, so we spread them directly instead of
// going through the @eslint/eslintrc FlatCompat bridge (which throws a circular-JSON error
// against the new flat config).
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ".playwright-mcp/**",
    ],
  },
];

export default eslintConfig;
