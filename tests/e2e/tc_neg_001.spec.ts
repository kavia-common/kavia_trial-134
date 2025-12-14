import { test, expect } from '@playwright/test';

/**
 * TC_NEG_001: Load Previous PDF (per Excel)
 * This test validates the "Load Previously Processed PDFs" flow using network mocks to avoid
 * external FastAPI dependency.
 *
 * Steps:
 * - Precondition: Seed API key in localStorage before first navigation so the app bypasses API configuration.
 * - Mock routes:
 *   - GET **/api/processed-pdfs → returns a stable list with one item:
 *       { pdf_id: 'mock-prev-1', pdf_file: 'test-corpus.pdf', sections_count: 5, total_images: 3, processed_at: '2025-01-01T00:00:00Z' }
 *   - Optionally mock sections load for mock-prev-1 if UI auto-loads after selection.
 * - Navigate to app and open "Load Previously Processed PDFs" modal.
 * - Select the mocked item and assert success UI.
 *
 * Locator strategy:
 * - Prefer role-based locators via getByRole with accessible names.
 */

test.describe('TC_NEG_001 - Load Previously Processed PDFs', () => {
  test('loads a previously processed PDF and shows success UI', async ({ page }) => {
    // Precondition: Seed API key so the app skips API Configuration gate.
    await page.addInitScript(() => {
      try {
        localStorage.setItem('pdf_api_key', 'test-key');
      } catch {}
    });

    // Early fetch stub to stabilize environments where app fetches immediately on load
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = async (input, init: RequestInit = {}) => {
        try {
          const url = typeof input === 'string' ? input : (input && (input as Request).url) || '';
          const method = ((init && init.method) || 'GET').toUpperCase();

          // Mock: list of previously processed PDFs
          if (url.includes('/api/processed-pdfs') && method === 'GET') {
            const body = JSON.stringify([
              {
                pdf_id: 'mock-prev-1',
                pdf_file: 'test-corpus.pdf',
                sections_count: 5,
                total_images: 3,
                processed_at: '2025-01-01T00:00:00Z'
              }
            ]);
            return new Response(body, {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          // Optional: some UIs may auto-load sections after selection
          if (url.includes('/api/sections/mock-prev-1') && method === 'GET') {
            const body = JSON.stringify([
              { section_id: 's1', title: 'Introduction', page_start: 1, page_end: 2 },
              { section_id: 's2', title: 'Methods', page_start: 3, page_end: 5 }
            ]);
            return new Response(body, {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          // Optional alternative: POST extract sections API
          if (url.includes('/api/extract-sections/mock-prev-1') && method === 'POST') {
            const body = JSON.stringify({
              pdf_id: 'mock-prev-1',
              sections: [{ section_id: 's1', title: 'Introduction', page_start: 1, page_end: 2 }]
            });
            return new Response(body, {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        } catch {
          // no-op and fall through to original fetch
        }
        return originalFetch(input as any, init);
      };
    });

    // In addition to init-script stubs, add routing mocks to catch XHR/fetch done after hydration
    await page.route('**/api/processed-pdfs', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            pdf_id: 'mock-prev-1',
            pdf_file: 'test-corpus.pdf',
            sections_count: 5,
            total_images: 3,
            processed_at: '2025-01-01T00:00:00Z'
          }
        ])
      });
    });
    await page.route('**/api/sections/mock-prev-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { section_id: 's1', title: 'Introduction', page_start: 1, page_end: 2 },
          { section_id: 's2', title: 'Methods', page_start: 3, page_end: 5 }
        ])
      });
    });

    // Navigate to the frontend (baseURL from config or default). If this repo only hosts tests,
    // this will target the provided running UI via PLAYWRIGHT_BASE_URL/REACT_APP_FRONTEND_URL.
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Ensure we are on the main app and not API configuration
    // App header should be visible if API key is accepted
    await expect(page.getByRole('heading', { name: /PDF Test Case Generator/i })).toBeVisible({ timeout: 10_000 });

    // Open the "Load Previously Processed PDFs" modal
    await page.getByRole('button', { name: /Load Previously Processed PDFs/i }).click();

    // Modal should show heading "Previously Processed PDFs"
    await expect(page.getByRole('heading', { name: /Previously Processed PDFs/i })).toBeVisible();

    // The mocked item should appear - click the button or list item that includes the pdf file name
    // Prefer role button with accessible name containing the file
    const itemButton = page.getByRole('button', { name: /test-corpus\.pdf/i });
    await expect(itemButton).toBeVisible();
    await itemButton.click();

    // After selection, the UI should confirm success in Step 2
    await expect(page.getByRole('heading', { name: /PDF Loaded Successfully!/i })).toBeVisible({ timeout: 10_000 });

    // The selected PDF ID should be present on the page (e.g., in Step 2 panel)
    await expect(page.getByText(/mock-prev-1/i)).toBeVisible();

    // Either "Load Sections" button is visible, or step 3 UI appears if auto-loaded
    const loadSectionsBtn = page.getByRole('button', { name: /Load Sections/i });
    const step3Heading = page.getByRole('heading', { name: /Select a Section/i });

    // Try to satisfy either condition
    const loadSectionsVisible = await loadSectionsBtn.isVisible().catch(() => false);
    const step3Visible = await step3Heading.isVisible().catch(() => false);

    expect(loadSectionsVisible || step3Visible).toBeTruthy();

    // Clean up routes
    await page.unroute('**/api/processed-pdfs');
    await page.unroute('**/api/sections/mock-prev-1');
  });
});
