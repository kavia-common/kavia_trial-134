import { test, expect } from '@playwright/test';

// This spec verifies that the application at the provided URL is reachable without authentication
// and renders a visible page with a non-empty title, running headless by default.
//
/**
 * The default target URL for accessibility checks is taken from the environment.
 * Falls back to a sensible local default when SITE_URL is missing, empty, or whitespace.
 */
const DEFAULT_TARGET_URL =
  process.env.SITE_URL && process.env.SITE_URL.trim()
    ? process.env.SITE_URL.trim()
    : 'http://localhost:3000';

test.describe('App accessibility (no-auth required)', () => {
  test('responds over HTTP and renders a visible page', async ({ page }) => {
    // Use the derived URL with safe fallback to ensure page.goto always receives a valid string.
    const targetUrl = DEFAULT_TARGET_URL;

    // Navigate to the target and wait for initial DOM content
    const response = await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000
    });

    // Assert that we received an HTTP response
    expect(response, `Navigation to ${targetUrl} should yield an HTTP response`).not.toBeNull();

    // Assert status < 400 (allow redirects or OK responses)
    const status = response ? response.status() : 0;
    expect(status, `Expected HTTP status < 400 for ${targetUrl}, got ${status}`).toBeLessThan(400);

    // Optionally wait for network to settle; if it doesn't, continue as long as DOM is there
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { /* ignore */ });

    // A visible <body> implies something rendered
    await expect(page.locator('body')).toBeVisible({ timeout: 10_000 });

    // Title should not be empty
    const title = (await page.title()).trim();
    expect(title.length, 'Expected non-empty page title').toBeGreaterThan(0);
  });
});
