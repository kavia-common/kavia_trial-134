import { test, expect } from '@playwright/test';

/**
 * TC_POS_001
 * Extended positive flow:
 *  - Open app
 *  - Ensure API Configuration is shown (clear localStorage first)
 *  - Enter API Key 'abc' and save
 *  - Upload a PDF using the file input
 *  - Assert that the app transitions to the "Load Sections" step with success confirmation
 *
 * Locator mapping usage:
 *  - Headings and buttons via getByRole (exact names from UI)
 *  - File chooser via input[type="file"] (per mapping)
 *  - Confirmation via success heading and presence of "Load Sections" button
 *
 * Notes:
 *  - We mock the upload endpoint to avoid reliance on an external backend.
 *  - Test remains headless by default (Playwright config).
 */
test.describe('TC_POS_001 - API key configuration positive flow', () => {
  test('sets API key to abc, uploads a PDF and proceeds to section loading', async ({ page }) => {
    // Ensure a clean session so API Configuration is shown
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Navigate to app base URL (from PLAYWRIGHT_BASE_URL or fallback)
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

    // Mock backend for upload endpoint to keep test deterministic and independent of external services.
    await page.route('**/api/upload-pdf', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ pdf_id: 'mock-pdf-123', is_reprocessed: false }),
      });
    });

    // Select the PDF file using the exact locator from mapping: input[type="file"]
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample.pdf');

    // Assert file selection shows in UI (file name appears)
    await expect(page.getByText('sample.pdf')).toBeVisible();

    // Trigger upload and wait for mocked response
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/upload-pdf') && res.status() === 200),
      page.getByRole('button', { name: 'Upload PDF' }).click(),
    ]);

    // Verify that we are on step 2: "Load Sections" with success message and PDF ID shown
    await expect(page.getByRole('heading', { name: 'PDF Uploaded Successfully!' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Load Sections' })).toBeVisible();
    await expect(page.getByText('mock-pdf-123')).toBeVisible();

    // Clean up route in case other tests run in the same browser context
    await page.unroute('**/api/upload-pdf');
  });
});
