import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    channel: "chrome",
    reducedMotion: "reduce"
  },
  webServer: {
    command: "npm run dev -- --silent",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI
  }
});
