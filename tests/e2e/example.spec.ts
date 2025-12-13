import { test, expect } from '@playwright/test';

test.describe('Example site', () => {
  test('can navigate to example.com and validate title', async ({ page }) => {
    await page.goto('https://example.com/');
    await expect(page).toHaveTitle(/Example Domain/);
    await expect(page.getByRole('heading', { name: 'Example Domain' })).toBeVisible();
  });

  test('page content contains expected text', async ({ page }) => {
    await page.goto('https://example.com/');
    await expect(page.locator('p')).toContainText('illustrative examples');
  });
});
