import { test, expect } from '@playwright/test';

/**
 * TC_POS_001
 * Positive flow:
 *  - Open app
 *  - Ensure API Configuration is shown (clear localStorage first)
 *  - Enter API Key 'abc'
 *  - Save API Key
 *  - Validate app navigates to main dashboard and key is persisted
 *
 * Selector strategy:
 *  - Prefer role-based locators per mapping (headings, labels, buttons).
 *  - Fallback to text locators where applicable.
 *  - If data-testid were provided in mapping, we would use them; none exist here,
 *    so role/name/text locators are used.
 */
test.describe('TC_POS_001 - API key configuration positive flow', () => {
  test('sets API key to abc and proceeds to the main flow', async ({ page }) => {
    // Ensure a clean session so API Configuration is shown
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Navigate to app base URL
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Verify API Configuration screen visible
    await expect(page.getByRole('heading', { name: 'API Configuration' })).toBeVisible();

    // Fill API Key with 'abc' via placeholder (label is not programmatically associated)
    await page.getByPlaceholder('Enter your API key').fill('abc');

    // Save API Key
    await page.getByRole('button', { name: 'Save API Key' }).click();

    // After saving, app should render main dashboard header
    await expect(page.getByRole('heading', { name: 'PDF Test Case Generator' })).toBeVisible();

    // Validate that first step panel is visible (Upload New PDF section)
    await expect(page.getByRole('heading', { name: 'Upload New PDF' })).toBeVisible();

    // Validate localStorage has the key set
    const storedKey = await page.evaluate(() => localStorage.getItem('pdf_api_key'));
    expect(storedKey).toBe('abc');

    // Optional: confirm Reset API Key control is present (navigation successful)
    await expect(page.getByRole('button', { name: 'Reset API Key' })).toBeVisible();
  });
});
