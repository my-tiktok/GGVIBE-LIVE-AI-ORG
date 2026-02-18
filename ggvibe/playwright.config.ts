import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:3000',
  },
  webServer: {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      NEXTAUTH_SECRET: 'playwright-secret-playwright-secret-123456',
      NEXTAUTH_URL: 'http://127.0.0.1:3000',
      NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3000',
    },
  },
});
