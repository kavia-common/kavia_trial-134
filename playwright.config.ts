 /**
 * Playwright configuration for E2E tests.
 *
 * Usage:
 *  - Install deps: npm install
 *  - Install browsers: npm run playwright:install
 *  - Run tests: npm run test:e2e
 *
 * You can set a base URL for relative navigations via:
 *  - SITE_URL (preferred; loaded from .env via dotenv)
 *  - PLAYWRIGHT_BASE_URL (fallback)
 *  - FRONTEND_URL (fallback)
 *
 * Note: We intentionally do not start any preview or dev server here.
 */
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env at the very beginning
dotenv.config();

// Resolve SITE_URL with a safe fallback if missing or blank
const SITE_URL =
  (process.env.SITE_URL && process.env.SITE_URL.trim()) || '';

const baseURL =
  SITE_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.FRONTEND_URL ||
  'http://localhost:3000';

console.log('Playwright baseURL:', baseURL);

export default defineConfig({
  // Where the tests live
  testDir: './tests/e2e',

  // Global timeouts
  timeout: 30 * 1000,
  expect: { timeout: 5 * 1000 },

  // Parallelization and CI behavior
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporters
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],

  // Default context/browser settings
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 0,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },

  // Run the test suite against Chromium, Firefox, and WebKit
  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'Firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'WebKit',
      use: { ...devices['Desktop Safari'] }
    }
  ],

  // Where to put artifacts from test runs
  outputDir: 'test-results'
});
