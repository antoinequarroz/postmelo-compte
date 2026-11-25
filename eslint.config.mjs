import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // New React Compiler rules (eslint-config-next 16). The compiler is not switched on here, and the
    // flagged spots are deliberate: data loaded when a panel mounts, the demos' animation refs, the
    // date in a server page. Shown as warnings, to be cleaned up when the compiler is turned on.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
    },
  },
  globalIgnores(["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "video/**"]),
]);
