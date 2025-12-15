import { Page, expect } from '@playwright/test';

/**
 * PUBLIC_INTERFACE
 * setApiKeyViaUI
 * This helper sets the API key via the app's API Configuration screen using UI interactions only.
 * It strictly uses mapped locators as per playwright-locator-mapping.md.
 */
export async function setApiKeyViaUI(page: Page, apiKey: string): Promise<void> {
  // Navigate to baseURL root—tests should call page.goto('/') prior; this function operates on the current page.
  // Check if API Configuration screen is present.
  const apiConfigHeading = page.getByRole('heading', { name: 'API Configuration' }); // MAPPED: heading[role] "API Configuration"
  const isApiConfigVisible = await apiConfigHeading.isVisible().catch(() => false);

  if (isApiConfigVisible) {
    // Fill API Key textbox using placeholder
    const apiKeyInput = page.getByPlaceholder('Enter your API key'); // MAPPED: input[placeholder="Enter your API key"]
    await expect(apiKeyInput).toBeVisible();
    await apiKeyInput.fill(apiKey);

    // Click Save API Key button
    const saveButton = page.getByRole('button', { name: 'Save API Key' }); // MAPPED: button[role][name="Save API Key"]
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Wait for main app heading to confirm navigation
    const mainHeading = page.getByRole('heading', { name: 'PDF Test Case Generator' }); // MAPPED: heading[role] "PDF Test Case Generator"
    await expect(mainHeading).toBeVisible({ timeout: 15000 });
  } else {
    // If not shown, ensure main app loaded (API key already set)
    const mainHeading = page.getByRole('heading', { name: 'PDF Test Case Generator' }); // MAPPED: heading[role] "PDF Test Case Generator"
    await expect(mainHeading).toBeVisible({ timeout: 15000 });
  }
}
