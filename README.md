# kavia_trial-134

This repository is currently a placeholder for future backend/experimentation. It now includes a Playwright + TypeScript end-to-end testing scaffold so you can write and execute browser tests locally or in CI.

## End-to-End Testing with Playwright (TypeScript)

### Prerequisites
- Node.js 18+ is recommended.

### Install dependencies
```bash
npm install
```

### Install Playwright browsers
This downloads the required browsers used by Playwright tests:
```bash
npm run playwright:install
```

### Run tests
- Headless (default):
  ```bash
  npm run test:e2e
  ```
- Headed (see the browser window):
  ```bash
  npm run test:e2e:headed
  ```
- UI mode (test explorer with watch/debug):
  ```bash
  npm run test:e2e:ui
  ```
- Debug mode (verbose, with inspector):
  ```bash
  npm run test:e2e:debug
  ```

### Base URL configuration (optional)
You can set a base URL for relative navigations:
- `PLAYWRIGHT_BASE_URL` (preferred)
- `REACT_APP_FRONTEND_URL` (fallback)

If neither is set, the default base URL is `http://localhost:3000`. The included example tests use an absolute URL (`https://example.com`) and do not rely on a running local application.

### Artifacts
- HTML report: `playwright-report/`
- Per-test artifacts (traces, videos, screenshots): `test-results/`

Playwright artifacts are ignored by Git via `.gitignore`.
