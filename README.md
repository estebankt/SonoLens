# SonoLens

![CI/CD Pipeline](https://github.com/estebankt/SonoLens/actions/workflows/ci.yml/badge.svg)

Translates the visual mood of an image into a Spotify playlist using AI — bridging GPT-4o Vision's scene understanding with Spotify's audio feature graph.

**Live:** https://sono-lens.vercel.app/

---

## Architecture & Design Decisions

### Stateless by design

SonoLens has no database. Playlist state lives in Spotify. This eliminates a persistence layer entirely — session data moves through HTTP-only cookies, generated playlists are saved directly to the user's Spotify library, and the server holds no long-lived state between requests.

### Image-to-audio feature pipeline

The core flow is a two-stage inference chain:

1. **Vision → Mood:** A compressed image (512x512, JPEG 0.7) is submitted to GPT-4o Vision with a structured prompt. The model returns a `MoodAnalysis` object — mood tags, energy level, emotional descriptors, genre seeds, and 8–12 specific seed tracks. Image downsampling at this stage saves ~20–30% on token cost with negligible quality loss.

2. **Mood → Tracks:** The API maps mood descriptors to Spotify audio parameters (valence, energy, danceability) via keyword inference, then searches Spotify for the AI-specified seed tracks in parallel batches of 5. This replaces Spotify's `/recommendations` endpoint, which proved unreliable and has since been deprecated in the API.

### OAuth 2.0 PKCE — no client secret in-flight

Spotify authentication uses PKCE: a `code_verifier` is generated client-side, hashed to a `code_challenge`, and the authorization code is exchanged server-side. The client secret is never transmitted to the browser. Tokens are stored in HTTP-only cookies, not `localStorage`.

### Demo mode without mocking the AI

Spotify's development quota limits OAuth access to 25 whitelisted accounts. Demo mode (`/demo` route, `demo_mode` cookie) bypasses Spotify calls with fixture data while keeping the real OpenAI analysis path active. This lets visitors experience the full AI output without requiring a whitelisted Spotify account.

### Graceful degradation on OpenAI failures

The image analysis endpoint tries `gpt-4o` → `gpt-4-turbo` → `gpt-4-vision-preview` in sequence, handling content filter rejections, oversized responses, and empty completions at each stage. Playlist cover image upload is similarly treated as non-fatal — failure there does not block playlist creation.

---

## Core Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit 2 (SSR + CSR hybrid) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| AI | OpenAI GPT-4o Vision |
| Music | Spotify Web API + Web Playback SDK |
| Unit Testing | Vitest 4 + Testing Library |
| E2E Testing | Playwright |
| Deployment | Vercel (adapter-vercel, Node.js runtime) |

---

## Engineering Standards

### Testing

203 unit tests cover the three core utility domains: image processing, mood-to-audio-feature mapping, and the Spotify API client wrapper. API endpoint tests use fixture-based mocks with a shared `sveltekit-mocks.ts` helper to simulate `RequestEvent`.

17 Playwright E2E tests cover the four critical paths: landing page, full creation flow, dashboard, and protected route redirection. E2E auth uses direct cookie injection (mock tokens) rather than real OAuth, keeping tests deterministic and CI-safe. API calls are intercepted via `page.route()`.

See [`docs/TestingGuide.md`](./docs/TestingGuide.md) for framework configuration and [`docs/TestingPlan.md`](./docs/TestingPlan.md) for the mocking strategy.

### CI/CD

GitHub Actions pipeline with five jobs:

- **Lint** and **Test** run in parallel on every push.
- **Build** (`tsc` + Vite) gates on both passing.
- **Deploy Preview** triggers on PRs, posts the URL as a PR comment, and feeds it to the E2E job.
- **Deploy Production** triggers on merge to `main`.

E2E tests run against the preview deployment, not production. Concurrency is scoped per `github.ref` with cancellation on superseding pushes.

### Linting & Formatting

ESLint with `@typescript-eslint` and the Svelte parser, enforced in CI. Prettier handles formatting. Both are required to pass before the build job runs.

---

## Getting Started

Requires a Spotify Developer application (redirect URI: `http://127.0.0.1:5173/auth/callback`) and an OpenAI API key with `gpt-4o` access.

```bash
git clone https://github.com/estebankt/SonoLens.git
cd SonoLens
npm install
cp .env.example .env
```

Populate `.env`:

```env
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/auth/callback
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o
```

```bash
npm run dev        # http://127.0.0.1:5173
npm run test       # unit tests
npm run test:e2e   # E2E (requires running dev server or sets one up automatically)
npm run check      # TypeScript
npm run lint       # ESLint + Prettier check
```

---

## Documentation

Detailed technical documentation is scoped to the relevant subdirectory rather than this file.

| Document | Contents |
|---|---|
| [`docs/TestingGuide.md`](./docs/TestingGuide.md) | Test structure, Vitest/Playwright config, auth mocking |
| [`docs/TestingPlan.md`](./docs/TestingPlan.md) | E2E strategy, API interception patterns |
| [`docs/CoveragePlan.md`](./docs/CoveragePlan.md) | Coverage targets by module |

---

## License

Unlicensed (private). Contact the maintainer for usage permissions.
