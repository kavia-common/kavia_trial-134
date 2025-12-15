import { test, expect } from '@playwright/test';
import { setApiKeyViaUI } from './utils/apiKeyHelper';

/**
 * TC_NEG_001
 * Negative E2E:
 *  - Start at baseURL
 *  - Set API key via UI with value 'xyz'
 *  - Navigate to Previously Processed PDFs view
 *  - Attempt to load list without mocks
 *  - Verify expected negative behavior (e.g., empty state message or error toast/banner)
 *
 * IMPORTANT:
 *  - Use locators strictly from playwright-locator-mapping.md (referenced in comments).
 *  - No mocks/stubs.
 *  - Use Playwright baseURL (do not hardcode localhost).
 */

test.describe('TC_NEG_001 - Previously Processed PDFs negative behavior', () => {
  test('shows empty state or proper error when loading previously processed PDFs', async ({ page }) => {
    // Start from base URL root; baseURL is configured in playwright.config.ts
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Use helper to set API key via UI with value 'xyz'
    await setApiKeyViaUI(page, 'xyz');

    // Ensure main UI visible
    await expect(page.getByRole('heading', { name: 'PDF Test Case Generator' })).toBeVisible(); // MAPPED: heading[role] "PDF Test Case Generator"

    // Open "Previously Processed PDFs" view
    // MAPPED: text "Load Previous PDF" and a button "Load Previously Processed PDFs"
    await expect(page.getByText(/Load Previous PDF/i)).toBeVisible({ timeout: 15000 }); // MAPPED: text content section
    const loadPrevButton = page.getByRole('button', { name: 'Load Previously Processed PDFs' }); // MAPPED: button[role][name="Load Previously Processed PDFs"]
    await expect(loadPrevButton).toBeVisible();
    await loadPrevButton.click();

    // Now attempt to load the list without mocks
    // Expected negative behavior: either an empty state or a visible error toast/banner.
    // Check for a known empty state message (case-insensitive)
    const emptyState = page.getByText(/no previously processed pdfs|no items found|nothing here yet/i); // MAPPED: text content for empty state
    const emptyVisible = await emptyState.isVisible().catch(() => false);

    // Also check for alert role or toast containing error keywords
    const alertRole = page.getByRole('alert'); // MAPPED: role="alert" for error messages
    const alertVisible = await alertRole.isVisible().catch(() => false);

    const genericErrorText = page.getByText(/error|failed|failure|unable to|not available/i); // MAPPED: text content generic error
    const genericErrorVisible = await genericErrorText.isVisible().catch(() => false);

    // One of the negative indicators should be present (empty or error)
    expect(emptyVisible || alertVisible || genericErrorVisible).toBeTruthy();

    // If an alert is visible, ensure it is not success variant (basic assertion)
    if (alertVisible) {
      await expect(alertRole).not.toContainText(/success|completed|ready/i);
    }
  });
});
