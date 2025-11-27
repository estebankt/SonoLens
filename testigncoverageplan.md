# Comprehensive Vitest Unit Test Coverage Plan

## Overview

Add comprehensive unit test coverage to SonoLens across 4 priority areas: utilities, Spotify client, API endpoints, and server-side AI logic. Target: 10-15+ test files with ~250+ tests, increasing coverage from ~10-15% to 80%+.

**User Requirements:**
- Comprehensive coverage (not quick wins)
- All 4 areas: API endpoints, mood-to-spotify utility, Spotify client functions, server AI logic
- Skip server test config fixes for now (keep jsdom environment)

---

## Implementation Strategy

### Phase 1: Test Infrastructure & Easy Wins (Priority: HIGH)
Start with test utilities and pure functions to build foundation.

### Phase 2: Spotify Client Functions (Priority: HIGH)
Test API client functions with fetch mocking.

### Phase 3: API Endpoints (Priority: MEDIUM)
Test SvelteKit routes with RequestEvent mocking.

### Phase 4: Server-Side AI Logic (Priority: MEDIUM)
Test OpenAI integration with SDK mocking.

---

## Test Files to Create/Expand

### 1. Test Utilities (Create First)
**Location:** `tests/unit/helpers/`

**Files to create:**
- `mocks.ts` - Mock factories (fetch, OpenAI, RequestEvent, cookies, files)
- `fixtures.ts` - Test data (MoodAnalysis, SpotifyTrack, user profiles)
- `sveltekit-mocks.ts` - SvelteKit-specific mocks (RequestEvent, cookies)

**Purpose:** Centralized reusable mocks and fixtures for all tests.

### 2. Utilities (Expand Existing + Create New)

**`src/lib/utils/mood-to-spotify.test.ts` (NEW)** - 388 lines untested
- **Priority: CRITICAL** - Complex business logic, pure functions (easy to test)
- **Test Suites (8):**
  - `mapEnergyLevel()` - Energy mapping (low/medium/high → 0.3/0.6/0.9)
  - `inferValence()` - Happiness from mood keywords (positive/negative counting)
  - `inferDanceability()` - Dance detection + energy-based fallback
  - `inferAcousticness()` - Acoustic vs electronic detection
  - `inferInstrumentalness()` - Instrumental keyword detection
  - `normalizeGenres()` - Genre mapping to Spotify's valid seeds (large lookup table)
  - `moodToSpotifyParams()` - Integration (combines all functions)
  - Edge cases - Empty arrays, undefined fields, invalid input
- **Estimated: 60+ tests**
- **No mocking needed** - All pure functions

**`src/lib/utils/image.test.ts` (EXPAND)** - 5 untested async functions
- **Current: 22 tests** for validation functions
- **Add test suites for:**
  - `fileToBase64()` - File to base64 conversion
  - `fileToBase64ForAI()` - Image compression (512x512, 0.7 quality)
  - `compressImageForSpotifyCover()` - Iterative compression to 250KB limit
  - `getImageDimensions()` - Returns width/height
  - `compressImage()` - General compression with params
- **Estimated: 35+ new tests**
- **Mocking: Canvas, Image APIs** (add to vitest-setup.ts)

### 3. Spotify Client (Expand Existing)

**`src/lib/spotify.test.ts` (EXPAND)** - ~15 untested functions
- **Current: 13 tests** for PKCE functions (generateCodeVerifier, generateCodeChallenge, getAuthorizationUrl)
- **Add test suites for:**
  - `getTokensFromSpotify()` - Token exchange with error handling
  - `refreshToken()` - Token refresh
  - `getUserProfile()` - User profile fetching
  - `getTopArtists()` - Top artists with time_range/limit params
  - `getTopTracks()` - Top tracks
  - `getRecentlyPlayed()` - Recently played tracks
  - `getRecommendations()` - Recommendations with seed limits (max 5 total)
  - `searchTracksByMood()` - Genre-based search
  - `searchArtist()` - Artist search (returns ID or null)
  - `searchTrack()` - Track search (deprecated, but test it)
  - `searchTrackFull()` - Track search with full data
  - `processBatches()` - Parallel batch processing utility
  - `getAvailableGenreSeeds()` - Genre seeds
  - `createPlaylist()` - Playlist creation
  - `addTracksToPlaylist()` - Add tracks
  - `uploadPlaylistCover()` - Cover upload with base64 prefix removal
- **Estimated: 85+ new tests**
- **Mocking: Global fetch** using `vi.fn()` with response factories

### 4. API Endpoints (Create New)

**All in `src/routes/api/*/+server.test.ts`**

**`analyze-image/+server.test.ts` (NEW)**
- Auth validation (401 when no token)
- Input validation (400 for missing/invalid fields)
- Image type validation (JPEG/PNG/WebP)
- Success path with mocked OpenAI
- Error handling (500 on AI failure)
- **Estimated: 10+ tests**

**`spotify/recommend/+server.test.ts` (NEW)**
- Auth validation
- Input validation (mood_analysis, seed_tracks)
- Parallel track search (batch processing)
- Track filtering (removes nulls)
- Limit parameter
- Error handling (404 when no tracks, 500 on failure)
- **Estimated: 12+ tests**

**`spotify/create-playlist/+server.test.ts` (NEW)**
- Auth validation
- Input validation (title, track_uris)
- Playlist creation flow (getUserProfile → createPlaylist → addTracks)
- Cover upload (optional, non-failing)
- is_public flag handling
- Error handling
- **Estimated: 13+ tests**

**`auth/refresh/+server.test.ts` (NEW)**
- Success path (updates access_token cookie)
- Missing refresh token (401)
- Spotify API failure (clears cookies, returns 401)
- **Estimated: 7+ tests**

**`auth/check/+server.test.ts` (NEW)**
- Returns authenticated:true with tokens
- Returns authenticated:false without tokens
- **Estimated: 5+ tests**

**Mocking Strategy:**
- SvelteKit `RequestEvent` with mock cookies, request, params
- Spotify client functions (import and mock with `vi.mock()`)
- OpenAI functions

### 5. Server-Side AI Logic (Expand Existing)

**`src/lib/server/ai.test.ts` (EXPAND)**
- **Current: Tests exist but excluded from runs** (vitest.config.ts line 16)
- **Keep excluded for now** per user request (skip config fixes)
- **Add test suites for:**
  - `analyzeWithFallback()` - Multi-model retry logic
  - `analyzeImage()` - Main function (calls analyzeWithFallback, parses JSON)
  - Error handling - Invalid JSON, missing fields, API errors
  - Fallback behavior - Tries multiple models in order
- **Estimated: 20+ new tests**
- **Mocking: OpenAI SDK** using `vi.mock('openai')`
- **Note:** These tests won't run until server test config is fixed, but we'll write them anyway

---

## Mocking Implementation Details

### Global Fetch Mock (for spotify.test.ts)

```typescript
// tests/unit/helpers/mocks.ts
import { vi } from 'vitest';

export function createFetchMock(responses: Record<string, any>) {
  return vi.fn((url: string, options?: RequestInit) => {
    const key = `${options?.method || 'GET'} ${url}`;
    const response = responses[key];

    return Promise.resolve({
      ok: response?.ok ?? true,
      status: response?.status ?? 200,
      statusText: response?.statusText ?? 'OK',
      json: () => Promise.resolve(response?.data || {}),
      text: () => Promise.resolve(JSON.stringify(response?.data || {}))
    });
  });
}
```

### SvelteKit RequestEvent Mock

```typescript
// tests/unit/helpers/sveltekit-mocks.ts
import type { RequestEvent } from '@sveltejs/kit';
import { vi } from 'vitest';

export function createMockRequestEvent(overrides: Partial<RequestEvent> = {}): RequestEvent {
  return {
    request: new Request('http://localhost:5173/api/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({})
    }),
    cookies: {
      get: vi.fn((name: string) => {
        if (name === 'spotify_access_token') return 'mock-access-token';
        return null;
      }),
      set: vi.fn(),
      delete: vi.fn(),
      serialize: vi.fn()
    },
    params: {},
    url: new URL('http://localhost:5173/api/test'),
    ...overrides
  } as unknown as RequestEvent;
}

export function createMockCookies(tokens?: { access?: string; refresh?: string }) {
  return {
    get: vi.fn((name: string) => {
      if (name === 'spotify_access_token') return tokens?.access || null;
      if (name === 'spotify_refresh_token') return tokens?.refresh || null;
      return null;
    }),
    set: vi.fn(),
    delete: vi.fn(),
    serialize: vi.fn()
  };
}
```

### OpenAI SDK Mock

```typescript
// In test files using ai.ts
import { vi } from 'vitest';

vi.mock('$env/static/private', () => ({
  OPENAI_API_KEY: 'test-api-key'
}));

vi.mock('$env/dynamic/private', () => ({
  env: { OPENAI_MODEL: 'gpt-4o' }
}));

vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{
              message: { content: JSON.stringify({ /* mock MoodAnalysis */ }) },
              finish_reason: 'stop'
            }]
          })
        }
      }
    }))
  };
});
```

### Canvas/Image Mock (for image.test.ts)

```typescript
// vitest-setup.ts (ADD TO EXISTING FILE)
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Image API
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  width = 1024;
  height = 768;

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}

global.Image = MockImage as any;
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  drawImage: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn()
})) as any;

HTMLCanvasElement.prototype.toDataURL = vi.fn(() =>
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a...'
);

HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  callback(new Blob(['mock-blob-data'], { type: 'image/jpeg' }));
});
```

### Test Fixtures

```typescript
// tests/unit/helpers/fixtures.ts
import type { MoodAnalysis, SpotifyTrack } from '$lib/types/phase2';

export const mockMoodAnalysis: MoodAnalysis = {
  mood_tags: ['melancholic', 'dreamy', 'atmospheric'],
  energy_level: 'medium',
  emotional_descriptors: ['nostalgic', 'contemplative', 'serene'],
  atmosphere: 'A misty, introspective landscape',
  recommended_genres: ['indie', 'ambient', 'dream-pop'],
  seed_tracks: ['Nude - Radiohead', 'Holocene - Bon Iver'],
  suggested_playlist_title: 'Misty Reflections',
  confidence_score: 0.85
};

export const mockSpotifyTrack: SpotifyTrack = {
  id: '6v3KW9xbzN5yKLt9YKDYA2',
  uri: 'spotify:track:6v3KW9xbzN5yKLt9YKDYA2',
  name: 'Holocene',
  artists: [{ id: '4LEiUm1SRbFMgfqnQTwUbQ', name: 'Bon Iver', uri: 'spotify:artist:4LEiUm1SRbFMgfqnQTwUbQ' }],
  album: {
    id: '1JlvIsP2f9YnXi3u8IxrsK',
    name: 'Bon Iver',
    images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273...', height: 640, width: 640 }]
  },
  duration_ms: 338960,
  preview_url: 'https://p.scdn.co/mp3-preview/...',
  external_urls: { spotify: 'https://open.spotify.com/track/...' },
  popularity: 72
};

export const mockUserProfile = {
  id: 'test-user-123',
  display_name: 'Test User',
  email: 'test@example.com',
  images: [{ url: 'https://i.scdn.co/image/...' }]
};

export function createMockFile(
  name: string = 'test.jpg',
  type: string = 'image/jpeg',
  size: number = 1024 * 1024
): File {
  return new File([new ArrayBuffer(size)], name, { type });
}
```

---

## Implementation Order

### Week 1: Foundation
1. Create `tests/unit/helpers/` directory structure
2. Create `mocks.ts`, `fixtures.ts`, `sveltekit-mocks.ts`
3. Update `vitest-setup.ts` with canvas/image mocks
4. **Complete `mood-to-spotify.test.ts`** (60+ tests, pure functions)
5. **Expand `image.test.ts`** (35+ new tests, canvas mocking)

**Deliverable:** ~95 new tests, test infrastructure in place

### Week 2: Spotify Client
1. Mock fetch globally in spotify.test.ts
2. Test token exchange functions (getTokensFromSpotify, refreshToken)
3. Test user data functions (getUserProfile, getTopArtists, getTopTracks, getRecentlyPlayed)
4. Test recommendations/search functions (getRecommendations, searchTracksByMood, searchArtist, searchTrackFull)
5. Test playlist functions (createPlaylist, addTracksToPlaylist, uploadPlaylistCover)
6. Test batch processing utility (processBatches)

**Deliverable:** ~85 new tests for Spotify client

### Week 3: API Endpoints
1. Create auth endpoint tests (auth/check, auth/refresh)
2. Create analyze-image endpoint test
3. Create spotify endpoint tests (recommend, create-playlist, search-tracks if exists)
4. Mock SvelteKit RequestEvent and cookies for all

**Deliverable:** ~47 new tests for API endpoints

### Week 4: AI & Polish
1. Expand ai.test.ts with OpenAI mocks (tests won't run yet, but written)
2. Test analyzeWithFallback retry logic
3. Test analyzeImage JSON parsing
4. Review coverage gaps and add edge case tests
5. Run coverage report (optional: install @vitest/coverage-v8)

**Deliverable:** ~20 new tests for AI logic, coverage report

---

## Testing Best Practices

1. **Test Structure:** Use AAA pattern (Arrange, Act, Assert)
2. **One concept per test:** Each test should verify one specific behavior
3. **Descriptive names:** Use "should..." format for test names
4. **Mock at boundaries:** Mock external APIs, not internal functions
5. **Reset mocks:** Use `beforeEach(() => vi.clearAllMocks())` in each describe block
6. **Async testing:** Always use async/await or return promises
7. **Error testing:** Test both success and error paths
8. **Edge cases:** Test empty arrays, undefined, null, boundary values

---

## Success Metrics

**Quantitative:**
- Test count: 250+ tests (from 35)
- Test files: 15+ files (from 3)
- Coverage: 80%+ (from ~10-15%)

**By Area:**
- Utilities: 95%+ coverage
- Spotify client: 90%+ coverage
- API endpoints: 80%+ coverage
- AI logic: Tests written (won't run until config fixed)

**Qualitative:**
- All critical business logic tested
- Edge cases covered
- Error handling validated
- Fast execution (<10s total)
- Clear, maintainable test code

---

## Files That Will Be Modified/Created

**Created:**
- `tests/unit/helpers/mocks.ts` (new)
- `tests/unit/helpers/fixtures.ts` (new)
- `tests/unit/helpers/sveltekit-mocks.ts` (new)
- `src/lib/utils/mood-to-spotify.test.ts` (new)
- `src/routes/api/analyze-image/+server.test.ts` (new)
- `src/routes/api/spotify/recommend/+server.test.ts` (new)
- `src/routes/api/spotify/create-playlist/+server.test.ts` (new)
- `src/routes/api/auth/refresh/+server.test.ts` (new)
- `src/routes/api/auth/check/+server.test.ts` (new)

**Expanded:**
- `src/lib/utils/image.test.ts` (add 35+ tests)
- `src/lib/spotify.test.ts` (add 85+ tests)
- `src/lib/server/ai.test.ts` (add 20+ tests, still excluded)
- `vitest-setup.ts` (add canvas/image mocks)

**Not Modified:**
- `vitest.config.ts` (keeping server tests excluded per user request)

---

## Notes

1. **Server tests excluded:** ai.test.ts tests will be written but won't run until the server test configuration is fixed (requires separate Node environment config). User requested we skip this for now.

2. **No new dependencies needed:** All testing can be done with existing Vitest, jsdom, and @testing-library/jest-dom packages.

3. **Coverage reporting (optional):** Can add `@vitest/coverage-v8` for detailed coverage reports.

4. **Parallel execution:** Vitest runs tests in parallel by default for fast execution.

5. **Existing test patterns:** Follow the patterns in image.test.ts and spotify.test.ts (describe/it structure, expect assertions, clear test names).
