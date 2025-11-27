TestingPlan.md
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 Playwright E2E Testing Implementation Plan

 Overview

 Add Playwright end-to-end tests to the SonoLens CI/CD pipeline that run against preview
 deployments after successful deployment. Tests will use mocked APIs and authentication for fast,
 deterministic execution.

 Strategy: Start minimal with 2 smoke tests, expand incrementally.

 ---
 Implementation Approach

 1. Playwright Setup

 Install dependencies:
 npm install -D @playwright/test
 npx playwright install --with-deps chromium

 Create playwright.config.ts:
 - Single browser (Chromium) for speed
 - BaseURL from PLAYWRIGHT_TEST_BASE_URL env variable
 - Sequential execution for predictable state
 - CI-optimized (GitHub reporter, retries, artifacts)
 - Skip local dev server in CI (test against deployed preview)

 2. Test Structure

 Directory: /tests/e2e/

 Initial test files:
 1. landing.spec.ts - Smoke test (page loads, login button visible)
 2. core-flow.spec.ts - Full flow: upload → analyze → generate → save (with mocked APIs)

 Test fixtures (/tests/e2e/fixtures/):
 - auth.ts - Set httpOnly cookies to bypass OAuth
 - mock-data.ts - Mock API responses (MoodAnalysis, SpotifyTrack[])
 - test-images.ts - Base64 test images

 3. Authentication Strategy

 Cookie-based bypass:
 // Set cookies directly in Playwright context
 await context.addCookies([
   { name: 'spotify_access_token', value: 'mock-token', httpOnly: true, ... },
   { name: 'spotify_refresh_token', value: 'mock-refresh', httpOnly: true, ... }
 ]);

 Benefits: No OAuth flow needed, instant test setup, no Spotify credentials required.

 4. API Mocking Strategy

 Use page.route() to intercept network requests:

 await page.route('**/api/analyze-image', async (route) => {
   await route.fulfill({
     status: 200,
     body: JSON.stringify({ success: true, mood_analysis: MOCK_MOOD_ANALYSIS })
   });
 });

 Mock endpoints:
 - /api/analyze-image - Return mock MoodAnalysis
 - /api/spotify/recommend - Return mock SpotifyTrack[]
 - /api/spotify/create-playlist - Return mock playlist ID
 - /api/auth/check - Return { authenticated: true }
 - /api/me - Return mock user profile

 5. GitHub Actions Integration

 Add new job to .github/workflows/ci.yml:

 e2e-tests:
   name: E2E Tests (Playwright)
   runs-on: ubuntu-latest
   needs: deploy-preview
   if: github.event_name == 'pull_request'

   steps:
     - uses: actions/checkout@v4
     - uses: actions/setup-node@v4
     - name: Cache node_modules
     - name: Install dependencies
     - name: Install Playwright Browsers
       run: npx playwright install --with-deps chromium
     - name: Run Playwright Tests
       env:
         PLAYWRIGHT_TEST_BASE_URL: ${{ needs.deploy-preview.outputs.preview-url }}
       run: npx playwright test
     - name: Upload Playwright Report
       if: always()
       uses: actions/upload-artifact@v4

 Pass preview URL:
 - Modify deploy-preview job: add outputs.preview-url
 - e2e-tests reads via needs.deploy-preview.outputs.preview-url
 - Set as PLAYWRIGHT_TEST_BASE_URL environment variable

 Pipeline flow:
 lint + test (parallel) → build → deploy-preview → e2e-tests

 ---
 Files to Create

 | File                              | Purpose                         |
 |-----------------------------------|---------------------------------|
 | playwright.config.ts              | Playwright configuration        |
 | tests/e2e/landing.spec.ts         | Smoke test for landing page     |
 | tests/e2e/core-flow.spec.ts       | Full authenticated flow test    |
 | tests/e2e/fixtures/auth.ts        | Cookie-based auth bypass helper |
 | tests/e2e/fixtures/mock-data.ts   | Mock API response data          |
 | tests/e2e/fixtures/test-images.ts | Base64 test images              |

 Files to Modify

 | File                     | Changes                                                      |
 |--------------------------|--------------------------------------------------------------|
 | package.json             | Add @playwright/test dependency, add test scripts            |
 | .github/workflows/ci.yml | Add outputs to deploy-preview, add e2e-tests job             |
 | .gitignore               | Add Playwright artifacts (test-results/, playwright-report/) |

 ---
 Implementation Steps

 Phase 1: Local Setup

 1. Install Playwright and browsers
 2. Create playwright.config.ts
 3. Create test fixtures (mock-data, auth, test-images)
 4. Create landing.spec.ts smoke test
 5. Run locally: npx playwright test landing.spec.ts

 Phase 2: Core Flow Test

 1. Create core-flow.spec.ts with API mocking
 2. Test full flow: upload → analyze → generate → save
 3. Run locally to verify mocks work correctly

 Phase 3: CI Integration

 1. Update package.json (dependency + scripts)
 2. Update .github/workflows/ci.yml:
   - Add outputs.preview-url to deploy-preview job
   - Add e2e-tests job after deploy-preview
 3. Update .gitignore
 4. Create PR to test pipeline

 Phase 4: Validation

 1. Verify e2e-tests job receives preview URL
 2. Check tests run against preview deployment
 3. Review Playwright report artifact if tests fail
 4. Iterate on flaky tests or timing issues

 ---
 Key Design Decisions

 Why Mock APIs?

 - Speed: No waiting for OpenAI/Spotify responses (~10s → <1s)
 - Cost: No OpenAI API charges per test run
 - Determinism: Same mock data = predictable test results
 - CI stability: No external API rate limits or downtime

 Why Cookie-Based Auth?

 - Simplicity: No OAuth redirect flow to handle
 - Speed: Instant authentication, no token exchange
 - No secrets: No Spotify credentials needed in CI
 - Maintainability: Auth logic tested separately in unit tests

 Why Test After Preview Deploy?

 - Real environment: Tests actual Vercel deployment, not localhost
 - Build validation: Ensures built app works, not just dev server
 - Production-like: Same environment, same routing, same SSR behavior

 ---
 Testing Coverage (MVP)

 Test 1: Landing Page Smoke Test

 - Page loads successfully
 - Title contains "SonoLens"
 - Login button is visible
 - Error query params display correctly

 Test 2: Core Flow (Mocked)

 - Navigate to dashboard (authenticated)
 - Click "Create Playlist from Image"
 - Upload test image
 - Verify image preview appears
 - Click "Analyze Image"
 - Verify mood analysis displays
 - Click "Generate Playlist"
 - Verify 20 tracks display
 - Click "Save to Spotify"
 - Verify success message

 ---
 Future Enhancements

 Phase 2 (after MVP):
 - Error scenario tests (network failures, validation errors)
 - Mobile viewport tests
 - Playlist editing (remove/reorder/add tracks)

 Phase 3 (advanced):
 - Cross-browser testing (Firefox, Safari)
 - Visual regression testing (screenshots)
 - Accessibility testing
 - Performance monitoring (Lighthouse CI)

 ---
 Critical Files for Reference

 1. .github/workflows/ci.yml:130 - deploy-preview job (needs outputs)
 2. src/lib/types/phase2.ts - Type definitions for mock data
 3. src/routes/create/+page.svelte - Main flow to test
 4. src/lib/server/ai.ts - AI analysis logic (to mock)
 5. src/lib/spotify.ts - Spotify API helpers (to mock)

 ---
 Success Criteria

 ✅ Playwright installed and configured
 ✅ 2 tests passing locally (landing + core flow)
 ✅ Tests integrated into CI pipeline
 ✅ Tests run against preview URL (not localhost)
 ✅ Test artifacts uploaded on failure
 ✅ Pipeline completes in <5 minutes total

 ---
 Estimated Time: 4-6 hours

 - Setup (1-2h): Install, config, fixtures
 - Landing test (0.5h): Simple smoke test
 - Core flow test (2-3h): Mocking, assertions, debugging
 - CI integration (1h): Workflow changes, testing on PR