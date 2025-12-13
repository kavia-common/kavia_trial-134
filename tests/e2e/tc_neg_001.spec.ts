import { test, expect } from '@playwright/test';

/**
 * TC_NEG_001
 * Negative flow:
 *  - Open app
 *  - Ensure API Configuration is shown (clear localStorage first)
 *  - Attempt to save without entering API key
 *  - Verify validation error and that we remain on API Configuration
 *
 * Selector strategy per mapping:
 *  - Prefer role-based locators (heading, button).
 *  - Error assertion via text matching as there is no specific role for the alert container.
 */
test.describe('TC_NEG_001 - API key configuration negative flow', () => {
  test('shows validation error when API key is empty', async ({ page }) => {
    // Ensure a clean session so API Configuration is shown
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Navigate to app base URL
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Verify API Configuration screen visible
    await expect(page.getByRole('heading', { name: 'API Configuration' })).toBeVisible();

    // Without entering any value, click save
    await page.getByRole('button', { name: 'Save API Key' }).click();

    // Assert validation message appears
    await expect(page.getByText('Please enter a valid API key')).toBeVisible();

    // Ensure we remain on the API Configuration screen
    await expect(page.getByRole('heading', { name: 'API Configuration' })).toBeVisible();

    // Ensure localStorage did not get a key saved
    const storedKey = await page.evaluate(() => localStorage.getItem('pdf_api_key'));
    expect(storedKey).toBeNull();
  });
});
