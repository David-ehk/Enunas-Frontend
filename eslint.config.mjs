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
      // Design-handoff / prototype blobs: standalone .jsx files that are NOT imported by any
      // route (verified) and reference globals from their original bundle, so they produce
      // hundreds of false-positive react/jsx-no-undef errors that drown out real lint signal.
      "app/**/dashboards/*.jsx",
      "app/**/brand_partner_v2/*.jsx",
      "app/**/design_handoff_cart/**",
    ],
  },
];

export default eslintConfig;
