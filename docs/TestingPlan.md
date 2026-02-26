# Playwright E2E Testing Implementation Plan

## Overview

Add Playwright end-to-end tests to the SonoLens CI/CD pipeline that run against Vercel preview
deployments. Tests will use mocked APIs and authentication for fast, deterministic execution.

**Strategy:** Start minimal with smoke tests, expand incrementally to full flow coverage.

## ⚠️ IMPORTANT NOTES ON VERCEL PREVIEW

**Requirement:** Vercel "Deployment Protection" (Vercel Authentication) MUST be disabled in the
project settings on the Vercel Dashboard for Playwright to access the preview URL without extra
headers.
- **Dashboard:** Settings > Deployment Protection > Vercel Authentication (Disable)

---

## Implementation Approach

### 1. Playwright Setup

Install dependencies:
```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

Create `playwright.config.ts`:
- Single browser (Chromium) for speed
- **BaseURL:** Uses `PLAYWRIGHT_TEST_BASE_URL` env var (Preview URL) or `localhost:5173` (Dev)
- Sequential execution for predictable state
- CI-optimized (GitHub reporter, retries, artifacts)

### 2. Test Structure

**Directory:** `/tests/e2e/`

**Test files:**
1. `landing.spec.ts` - Smoke tests (page loads, login button visible, error states)
2. `core-flow.spec.ts` - Authenticated flow tests (access control, file upload, full journey)

**Test fixtures** (`/tests/e2e/fixtures/`):
- `auth.ts` - Set httpOnly cookies to bypass OAuth
- `mock-data.ts` - Mock API responses (MoodAnalysis, SpotifyTrack[])
- `test-images.ts` - Base64 test images

### 3. Authentication Strategy

**Cookie-based bypass** (`tests/e2e/fixtures/auth.ts`):
```javascript
// Dynamically use the current BaseURL (Preview URL or Localhost)
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173';
await context.addCookies([
  { name: 'spotify_access_token', value: 'mock-token', url: baseURL, httpOnly: true, ... },
  { name: 'spotify_refresh_token', value: 'mock-refresh', url: baseURL, httpOnly: true, ... }
]);
```

**Benefits:** No OAuth flow needed, instant test setup, no Spotify credentials required.

### 4. API Mocking Strategy

Use `page.route()` to intercept network requests:

```javascript
await page.route('**/api/analyze-image', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true, mood_analysis: MOCK_MOOD_ANALYSIS })
  });
});
```

**Mock endpoints:**
- `/api/analyze-image` - Return mock MoodAnalysis
- `/api/spotify/recommend` - Return mock SpotifyTrack[]
- `/api/spotify/create-playlist` - Return mock playlist ID
- `/api/auth/check` - Return `{ authenticated: true }`
- `/api/me` - Return mock user profile

### 5. GitHub Actions Integration

**Job configuration** (`.github/workflows/ci.yml`):

```yaml
e2e-tests:
  name: E2E Tests (Playwright)
  runs-on: ubuntu-latest
  needs: deploy-preview  # Depends on successful deployment
  if: github.event_name == 'pull_request'

  steps:
    # ... setup steps ...
    - name: Run Playwright Tests
      env:
        PLAYWRIGHT_TEST_BASE_URL: ${{ needs.deploy-preview.outputs.preview-url }}
      run: npx playwright test
```

**Pipeline flow:**
```
lint + test (parallel) → build → deploy-preview → e2e-tests
```

**Benefits:**
- Tests actual cloud environment (SSR behavior, headers, routing)
- Validates deployment success before verification
- Catch platform-specific issues

---

## Files Created

| File                              | Purpose                         | Status |
|-----------------------------------|---------------------------------|--------|
| `playwright.config.ts`            | Playwright configuration        | ✅ Done |
| `tests/e2e/landing.spec.ts`       | Smoke test for landing page     | ✅ Done |
| `tests/e2e/core-flow.spec.ts`     | Authenticated flow tests        | ✅ Done |
| `tests/e2e/fixtures/auth.ts`      | Cookie-based auth bypass helper | ✅ Done |
| `tests/e2e/fixtures/mock-data.ts` | Mock API response data          | ✅ Done |
| `tests/e2e/fixtures/test-images.ts` | Base64 test images            | ✅ Done |

## Files Modified

| File                     | Changes                                                      | Status |
|--------------------------|--------------------------------------------------------------|--------|
| `package.json`           | Add @playwright/test dependency, add test scripts            | ✅ Done |
| `.github/workflows/ci.yml` | Connect e2e-tests to deploy-preview output                 | ✅ Done |
| `.gitignore`             | Add Playwright artifacts (test-results/, playwright-report/) | ✅ Done |

---

## Implementation Steps

### ✅ Phase 1: Local Setup (COMPLETED)

1. ✅ Install Playwright and browsers
2. ✅ Create `playwright.config.ts`
3. ✅ Create test fixtures (mock-data, auth, test-images)
4. ✅ Create `landing.spec.ts` smoke test
5. ✅ Run locally: `npx playwright test`

### ✅ Phase 2: Core Flow Test (COMPLETED)

1. ✅ Create `core-flow.spec.ts` with API mocking setup
2. ✅ Test authenticated access to `/create` page
3. ✅ Test full flow: upload → analyze → generate → save

### ✅ Phase 3: CI Integration (COMPLETED)

1. ✅ Update `package.json` (dependency + scripts)
2. ✅ Update `.github/workflows/ci.yml`:
   - Pass `preview-url` output from `deploy-preview`
   - Configure `e2e-tests` to use `PLAYWRIGHT_TEST_BASE_URL`
3. ✅ Update `.gitignore`

### ✅ Phase 4: Expand Coverage (PARTIALLY DONE)

1. ✅ Dashboard tests (`tests/e2e/dashboard.spec.ts` — 6 tests: profile, top artists, top tracks, recently played, create button, logout)
2. ✅ Protected route tests (`tests/e2e/protected-routes.spec.ts` — 3 tests: unauthenticated redirects for `/create` and `/dashboard`)
3. ⏳ Error scenario tests (network failures, validation errors)
4. ⏳ Mobile viewport tests

---

## Key Design Decisions

### Why Mock APIs?

- **Speed:** No waiting for OpenAI/Spotify responses (~10s → <1s)
- **Cost:** No OpenAI API charges per test run
- **Determinism:** Same mock data = predictable test results
- **CI stability:** No external API rate limits or downtime

### Why Cookie-Based Auth?

- **Simplicity:** No OAuth redirect flow to handle
- **Speed:** Instant authentication, no token exchange
- **No secrets:** No Spotify credentials needed in CI
- **Maintainability:** Auth logic tested separately in unit tests

### Why Test Against Vercel Preview?

- **Real environment:** Tests actual Vercel deployment, not localhost
- **Build validation:** Ensures built app works in cloud environment
- **Production-like:** Same environment, same routing, same SSR behavior