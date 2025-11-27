# Playwright E2E Testing Implementation Plan

## Overview

Add Playwright end-to-end tests to the SonoLens CI/CD pipeline that run against the production
build served locally. Tests will use mocked APIs and authentication for fast, deterministic execution.

**Strategy:** Start minimal with smoke tests, expand incrementally to full flow coverage.

## ⚠️ IMPORTANT IMPLEMENTATION NOTES (Updated Nov 27, 2025)

The original plan was to test against Vercel preview deployments, but we encountered an issue:
**Vercel's Deployment Protection feature blocks all requests with SSO login before the app runs.**

**SOLUTION:** Tests now run against **localhost preview server** (`npm run preview`) that serves the
production build. This approach is actually better:
- ✅ No Vercel protection blocking
- ✅ Faster (no network latency)
- ✅ More reliable (no external dependencies)
- ✅ Tests the actual built app (not dev mode)
- ✅ Industry best practice

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
- **BaseURL:** `localhost:4173` in CI (preview server), `localhost:5173` locally (dev server)
- Sequential execution for predictable state
- CI-optimized (GitHub reporter, retries, artifacts)
- **CI:** Starts preview server (`npm run preview`) to serve built app
- **Local:** Starts dev server (`npm run dev`) for faster iteration

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
const baseURL = process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173';
await context.addCookies([
  { name: 'spotify_access_token', value: 'mock-token', url: baseURL, httpOnly: true, ... },
  { name: 'spotify_refresh_token', value: 'mock-refresh', url: baseURL, httpOnly: true, ... }
]);
```

**Benefits:** No OAuth flow needed, instant test setup, no Spotify credentials required.

**Note:** Use `url` parameter (not `domain`) for localhost cookies in Playwright.

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
  needs: build  # Changed from deploy-preview
  if: github.event_name == 'pull_request' || github.event_name == 'push'

  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - name: Cache node_modules
    - name: Install dependencies
    - name: Build application
      run: npm run build  # Build the app first
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps chromium
    - name: Run Playwright Tests
      run: npx playwright test  # No PLAYWRIGHT_TEST_BASE_URL needed
    - name: Upload Playwright Report
      if: always()
      uses: actions/upload-artifact@v4
```

**IMPORTANT:** No preview URL needed!
- Tests run against `localhost:4173` (preview server started by Playwright config)
- Playwright config automatically starts `npm run preview` in CI
- This serves the production build locally for testing

**Pipeline flow (UPDATED):**
```
lint + test (parallel) → build → e2e-tests + deploy-preview (parallel)
```

**Benefits:**
- Tests run in parallel with deployment (faster pipeline)
- No dependency on Vercel deployment protection
- More reliable and deterministic

---

## Files Created

| File                              | Purpose                         | Status |
|-----------------------------------|---------------------------------|--------|
| `playwright.config.ts`            | Playwright configuration        | ✅ Done |
| `tests/e2e/landing.spec.ts`       | Smoke test for landing page     | ✅ Done |
| `tests/e2e/core-flow.spec.ts`     | Authenticated flow tests        | 🚧 Partial |
| `tests/e2e/fixtures/auth.ts`      | Cookie-based auth bypass helper | ✅ Done |
| `tests/e2e/fixtures/mock-data.ts` | Mock API response data          | ✅ Done |
| `tests/e2e/fixtures/test-images.ts` | Base64 test images            | ✅ Done |

## Files Modified

| File                     | Changes                                                      | Status |
|--------------------------|--------------------------------------------------------------|--------|
| `package.json`           | Add @playwright/test dependency, add test scripts            | ✅ Done |
| `.github/workflows/ci.yml` | Add e2e-tests job after build (parallel with deploy)       | ✅ Done |
| `.gitignore`             | Add Playwright artifacts (test-results/, playwright-report/) | ✅ Done |

---

## Implementation Steps

### ✅ Phase 1: Local Setup (COMPLETED)

1. ✅ Install Playwright and browsers
2. ✅ Create `playwright.config.ts`
3. ✅ Create test fixtures (mock-data, auth, test-images)
4. ✅ Create `landing.spec.ts` smoke test
5. ✅ Run locally: `npx playwright test`

### 🚧 Phase 2: Core Flow Test (IN PROGRESS)

1. ✅ Create `core-flow.spec.ts` with API mocking setup
2. ✅ Test authenticated access to `/create` page
3. 🚧 Test full flow: upload → analyze → generate → save
4. ⏳ Run locally to verify mocks work correctly

### ✅ Phase 3: CI Integration (COMPLETED)

1. ✅ Update `package.json` (dependency + scripts)
2. ✅ Update `.github/workflows/ci.yml`:
   - Add e2e-tests job after build
   - Run tests against localhost preview server
3. ✅ Update `.gitignore`
4. ✅ Tests passing in CI (7/7 tests)

### ⏳ Phase 4: Expand Coverage (TODO)

1. ⏳ Implement full user journey test
2. ⏳ Add error scenario tests
3. ⏳ Add file validation tests
4. ⏳ Review and iterate on flaky tests

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

### Why Test Against Localhost Preview Server? (UPDATED)

Originally planned to test against Vercel preview, but changed due to Deployment Protection blocking.

**Benefits of localhost testing:**
- **Build validation:** Tests actual production build (`npm run build` → `npm run preview`)
- **No external dependencies:** Vercel protection, rate limits, or network issues
- **Faster execution:** No network latency to cloud deployment
- **Production-like:** Same SSR behavior, routing, and build output as production
- **Cost effective:** No additional Vercel bandwidth or function invocations
- **Industry standard:** Most teams test against locally served builds

---

## Testing Coverage

### ✅ IMPLEMENTED - Phase 1: Smoke Tests (7 tests passing)

**Test Suite 1: Landing Page** (`tests/e2e/landing.spec.ts`)
- ✅ Page loads successfully
- ✅ Hero content displays "SonoLens"
- ✅ Login button is visible
- ✅ Error message for `access_denied`
- ✅ Error message for `session_expired`
- ✅ Error message for `token_exchange_failed`
- ✅ Error message for `unknown_error`

**Test Suite 2: Core Flow - Authenticated Access** (`tests/e2e/core-flow.spec.ts`)
- ✅ Authenticated user can access `/create` page (no redirect to login)
- ✅ File upload interface is visible

### 🚧 TODO - Phase 2: Full Flow Test

**Test Suite 3: Complete User Journey** (`tests/e2e/core-flow.spec.ts` - TO BE ADDED)
- ⏳ Upload test image
- ⏳ Verify image preview appears
- ⏳ Click "Analyze Image"
- ⏳ Verify mood analysis displays (moods, colors, energy, genres)
- ⏳ Click "Generate Playlist"
- ⏳ Verify tracks display (20 tracks with album art, artist, track name)
- ⏳ Click "Save to Spotify"
- ⏳ Verify success message with playlist link

### 🚧 TODO - Phase 3: Error Scenarios

- ⏳ Invalid file type (GIF) rejection
- ⏳ File too large (>10MB) rejection
- ⏳ Network error handling
- ⏳ Empty playlist state

---

## Future Enhancements

### Phase 4 (after MVP):
- Error scenario tests (network failures, validation errors)
- Mobile viewport tests
- Playlist editing (remove/reorder/add tracks)
- Dashboard tests (user profile, saved playlists)

### Phase 5 (advanced):
- Cross-browser testing (Firefox, Safari)
- Visual regression testing (screenshots)
- Accessibility testing
- Performance monitoring (Lighthouse CI)

---

## Critical Files for Reference

1. `.github/workflows/ci.yml:191` - e2e-tests job configuration
2. `playwright.config.ts` - Playwright configuration with webServer
3. `tests/e2e/fixtures/auth.ts` - Authentication cookie setup
4. `src/lib/types/phase2.ts` - Type definitions for mock data
5. `src/routes/create/+page.svelte` - Main flow to test

---

## Success Criteria

### ✅ COMPLETED
- ✅ Playwright installed and configured
- ✅ 7 tests passing locally and in CI (landing + authenticated access)
- ✅ Tests integrated into CI pipeline
- ✅ Tests run against localhost preview server (production build)
- ✅ Test artifacts uploaded on failure
- ✅ Pipeline completes in <5 minutes total
- ✅ Fixed Vercel Deployment Protection blocking issue
- ✅ Mock authentication cookies working correctly

### 🚧 IN PROGRESS
- 🚧 Implement full flow test (upload → analyze → generate → save)
- ⏳ Add error scenario tests
- ⏳ Add file validation tests

---

## Troubleshooting

### Issue: Tests redirecting to Vercel login page
**Solution:** Tests now run against localhost preview server, not Vercel deployment.

### Issue: Cookies not working in Playwright
**Solution:** Use `url` parameter instead of `domain` for localhost cookies:
```javascript
{ name: 'cookie_name', value: 'value', url: 'http://localhost:5173', ... }
```

### Issue: ESLint error - unused variable
**Solution:** Remove unused variables (e.g., `url` variable if only `baseURL` is used).

---

## Estimated Time

- **Setup (1-2h):** ✅ DONE - Install, config, fixtures
- **Landing test (0.5h):** ✅ DONE - Simple smoke test
- **Core flow test (2-3h):** 🚧 IN PROGRESS - Mocking, assertions, debugging
- **CI integration (1h):** ✅ DONE - Workflow changes, testing on PR
- **Troubleshooting (2h):** ✅ DONE - Fixed Vercel protection issue, cookie setup

**Total: ~6.5 hours (4.5 hours completed, 2 hours remaining)**
