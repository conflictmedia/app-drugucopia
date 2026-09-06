import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/vitest.setup.ts"],
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/**",
      "**/*.spec.ts",
      "**/*.spec.tsx",
    ],
    // Node ≥26 makes its webstorage (Storage/localStorage) unavailable
    // without a persistence file, and current jsdom defers to the host —
    // so window.localStorage is undefined in tests otherwise. Point the
    // flag at a throwaway gitignored file to restore a working Storage
    // for tests like timeline-view-preference.
    execArgv: ["--localstorage-file", ".vitest-localstorage"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
