# SonoLens

![CI/CD Pipeline](https://github.com/estebankt/SonoLens/actions/workflows/ci.yml/badge.svg)

Live: https://sono-lens.vercel.app/

Upload an image, get a Spotify playlist. SonoLens uses GPT-4o Vision to read the mood, colors, and atmosphere of a photo and turns that into a playlist. Built with SvelteKit and a Neo-Brutalist design.

---

## Demo mode

The app is in Spotify's development mode, which limits access to 25 manually whitelisted accounts. To get around this, there's a demo mode that lets anyone try the full flow without a Spotify account.

Click **"Try Demo"** on the homepage. You'll go through the same steps — upload an image, get a real AI analysis, browse generated tracks — but the playlist recommendations use mock data and saving is simulated. The OpenAI image analysis still runs for real.

---

## Features

- Spotify OAuth 2.0 with PKCE
- Image analysis via GPT-4o Vision (mood, energy, color, atmosphere)
- Generates ~20 track recommendations
- 30-second track previews in the browser
- Edit the playlist: remove or reorder tracks before saving
- Save directly to your Spotify library
- Works on mobile (camera capture supported)

---

## Tech stack

- SvelteKit (SSR/CSR)
- TypeScript
- Tailwind CSS
- OpenAI API (GPT-4o Vision)
- Spotify Web API
- Vitest (unit tests), Playwright (E2E)
- Vercel

---

## Setup

You'll need a Spotify developer account and an OpenAI API key.

**Spotify:** Create an app at https://developer.spotify.com/dashboard and set the redirect URI to `http://127.0.0.1:5173/auth/callback`.

**OpenAI:** Get a key at https://platform.openai.com — needs access to `gpt-4o`.

```bash
git clone https://github.com/yourusername/sonolens.git
cd sonolens
npm install
cp .env.example .env
```

Fill in `.env`:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/auth/callback
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o
```

```bash
npm run dev
```

Open `http://127.0.0.1:5173`.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server |
| `npm run check` | TypeScript type check |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | E2E tests (Playwright) |
| `npm run lint` | Lint |
| `npm run format` | Format with Prettier |

---

## CI/CD

GitHub Actions pipeline with parallel lint/test jobs, node_modules caching, and automatic Vercel deploys.

- Feature branches: lint, test, build
- Pull requests: lint, test, build, preview deploy (URL posted as PR comment)
- Main: lint, test, build, production deploy

E2E tests run against a local preview server, not the deployed environment.

---

## Docs

- [Testing Guide](./docs/TestingGuide.md)
- [Testing Plan](./docs/TestingPlan.md)
- [Coverage Plan](./docs/CoveragePlan.md)

---

## License

Unlicensed (private). Contact the maintainer for usage permissions.
