import { test, expect } from '@playwright/test';

/**
 * TC_NEG_001: Load Previous PDF
 *
 * Steps:
 * 1) If needed, fill 'abc' in API key and proceed.
 * 2) Check for 'Load Previous PDF' and click 'Load Previously Processed PDFs';
 *    intercept and verify GET /api/processed-pdfs returns success; assert no failure messages are shown.
 *
 * Notes:
 * - Use exact, role-based locators aligned with the pdf-testcase-generator UI.
 * - Replace any Unicode arrow (→) occurrences in comments with ASCII '->'.
 */

test.describe('TC_NEG_001 - Load Previously Processed PDFs', () => {
  test('conditionally seeds API key, loads previously processed PDFs and verifies success', async ({ page }) => {
    // Navigate to the app base URL (configured in playwright.config.ts)
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Step 1 -> If needed, fill 'abc' in API key and proceed
    // Check if API Configuration gate is visible; if so, seed API key and continue.
    const apiConfigVisible = await page
      .getByRole('heading', { name: 'API Configuration' })
      .isVisible()
      .catch(() => false);

    if (apiConfigVisible) {
      // Fill API key input (placeholder text is "Enter your API key" per app UI)
      await page.getByPlaceholder('Enter your API key').fill('abc');
      // Click Save API Key button
      await page.getByRole('button', { name: 'Save API Key' }).click();
      // Wait for main app heading to be visible indicating we have proceeded
      await expect(
        page.getByRole('heading', { name: 'PDF Test Case Generator' })
      ).toBeVisible({ timeout: 15000 });
    }

    // Ensure the main app is visible if API key was already present
    await expect(
      page.getByRole('heading', { name: 'PDF Test Case Generator' })
    ).toBeVisible({ timeout: 15000 });

    // Step 2 -> Check for 'Load Previous PDF' and click 'Load Previously Processed PDFs'
    // Verify the presence of the "Load Previous PDF" text/option in the UI
    await expect(page.getByText(/Load Previous PDF/i)).toBeVisible({ timeout: 10000 });

    // Intercept GET /api/processed-pdfs and verify it returns success
    // Prepare a promise to capture the request and response
    const processedPdfsRequest = page.waitForRequest((req) => {
      return req.method() === 'GET' && /\/api\/processed-pdfs(\?|$)/.test(req.url());
    });

    const processedPdfsResponse = page.waitForResponse((res) => {
      return res.request().method() === 'GET' && /\/api\/processed-pdfs(\?|$)/.test(res.url());
    });

    // Click the control to load previously processed PDFs (role-based locator)
    await page.getByRole('button', { name: 'Load Previously Processed PDFs' }).click();

    // Await the request and response then assert the response status is 2xx
    const req = await processedPdfsRequest;
    const res = await processedPdfsResponse;
    const status = res.status();
    expect(
      status >= 200 && status < 300,
      `Expected GET ${req.url()} to return 2xx, got ${status}`
    ).toBeTruthy();

    // Assert no visible failure/error toasts or banners after the call.
    // Common patterns: generic error banners, toast messages containing error keywords.
    // Use soft assertions to not hide missing selectors as failures if they are absent.
    await expect(page.getByText(/error|failed|failure|unable to/i)).not.toBeVisible({ timeout: 3000 });
    // If the app uses an explicit alert role for errors, verify none are visible
    const anyAlertVisible = await page
      .getByRole('alert')
      .isVisible()
      .catch(() => false);
    expect(anyAlertVisible).toBeFalsy();
  });
});
