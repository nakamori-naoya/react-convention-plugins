import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // MSW が差し替える backend の base URL
    env: { VITE_API_BASE_URL: "http://api.test" },
  },
});
