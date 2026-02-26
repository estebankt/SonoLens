# Testing Guide

## Frameworks

- **Vitest** — unit tests
- **Playwright** — E2E tests
- **jsdom** — browser environment for unit tests

## Running tests

```bash
# Unit tests
npm test
npm run test:watch

# E2E tests
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed

# Type checking
npm run check
npm run lint
```

---

## Unit test structure

Unit tests live in two places:

- `src/lib/utils/` — pure utility functions tested alongside source
- `tests/unit/` — everything else (API endpoints, Spotify client, helpers)

```
tests/unit/
├── api/
│   ├── analyze-image/analyze-image.test.ts
│   ├── auth/check.test.ts
│   ├── auth/refresh.test.ts
│   └── spotify/
│       ├── create-playlist.test.ts
│       ├── recommend.test.ts
│       └── search-tracks.test.ts
├── lib/
│   └── spotify.test.ts
└── helpers/
    ├── fixtures.ts
    ├── mocks.ts
    └── sveltekit-mocks.ts

src/lib/utils/
├── image.test.ts
└── mood-to-spotify.test.ts
```

**Current total: 203 unit tests across 9 test files.**

### Coverage by area

| Area | Tests | Notes |
|---|---|---|
| `mood-to-spotify` utilities | 53 | Pure functions, energy/valence/genre mapping |
| Spotify client functions | 46 | Token exchange, search, playlist management |
| Image utilities | 53 | Validation, compression, base64 conversion |
| API: create-playlist | 15 | Auth, input validation, Spotify flow |
| API: analyze-image | 10 | Auth, image type validation, AI error handling |
| API: recommend | 8 | Auth, batch processing, track filtering |
| API: auth/check | 5 | Token presence checks |
| API: auth/refresh | 7 | Token refresh, cookie updates, error paths |
| API: search-tracks | 6 | Search query handling |

---

## E2E test structure

```
tests/e2e/
├── landing.spec.ts        — homepage, error states, demo button
├── core-flow.spec.ts      — authenticated create flow (upload → analyze → generate → save)
├── dashboard.spec.ts      — user profile, top artists/tracks, recently played
├── protected-routes.spec.ts — unauthenticated redirects
└── fixtures/
    ├── auth.ts            — cookie-based auth bypass
    ├── mock-data.ts       — mock API responses
    └── test-images.ts     — base64 test images
```

**Current total: 17 E2E tests across 4 spec files.**

### Authentication strategy

E2E tests bypass OAuth by injecting mock Spotify cookies directly:

```typescript
// tests/e2e/fixtures/auth.ts
await context.addCookies([
  { name: 'spotify_access_token', value: 'mock-access-token-for-e2e-tests', ... },
  { name: 'spotify_refresh_token', value: 'mock-refresh-token', ... }
]);
```

The value `mock-access-token-for-e2e-tests` is checked in server load functions to return mock data instead of calling Spotify.

Demo mode tests use the `/demo` route which sets a `demo_mode` cookie server-side.

### API mocking strategy

E2E tests use `page.route()` to intercept network requests:

```typescript
await page.route('**/api/analyze-image', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true, mood_analysis: MOCK_MOOD_ANALYSIS })
  });
});
```

---

## Test configuration

### `vitest.config.ts`

```typescript
{
  include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.svelte-kit/**',
    'src/lib/server/**/*.test.ts',  // server-only tests excluded (jsdom limitation)
    'tests/example.test.ts'
  ],
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./vitest-setup.ts']
}
```

### `vitest-setup.ts`

Sets up Testing Library matchers and mocks for canvas/Image APIs used by image compression tests.

---

## CI/CD

Unit tests and E2E tests run on every push and pull request. See `.github/workflows/ci.yml`.

E2E tests run against a local preview server (not the deployed Vercel environment) for speed and reliability.

---

## Known limitations

- Server-side tests importing `$env/static/private` or the OpenAI SDK are excluded from the jsdom environment (`src/lib/server/`). These require a separate server test config to run.
- Svelte 5 component tests are not set up — the Testing Library integration needs updating for Svelte 5 runes.
