import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {},
  },
  webServer: {
    command: 'python scripts/serve.py 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'ignore',
  },
});
