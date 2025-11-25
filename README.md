# SonoLens

Transform images into Spotify playlists using AI.

## MVP Status

The current MVP implements **Spotify Authorization Code with PKCE** flow, allowing users to:
- Authenticate with their Spotify account
- View their profile information in a Neo-Brutalism styled dashboard
- Securely manage OAuth tokens

## Prerequisites

1. Create a Spotify Developer App:
   - Go to https://developer.spotify.com/dashboard
   - Create a new app
   - Add `http://127.0.0.1:5173/auth/callback` to Redirect URIs
   - Copy your Client ID

2. Configure environment variables:
   - Copy `.env` and add your Spotify Client ID:
   ```sh
   SPOTIFY_CLIENT_ID=your_actual_client_id_here
   SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/auth/callback
   ```

## Setup

Install dependencies:

```sh
npm install
```

## Development

Start the development server:

```sh
npm run dev
```

Visit http://127.0.0.1:5173 and click "Login with Spotify" to test the OAuth flow.

## Project Structure

```
src/
  lib/
    spotify.ts              # Spotify API helpers (OAuth, user profile)
  routes/
    +layout.svelte          # Root layout with global styles
    +page.svelte            # Landing page
    auth/
      login/+server.ts      # Initiates OAuth flow
      callback/+server.ts   # Handles OAuth callback
      logout/+server.ts     # Clears session
    dashboard/
      +page.svelte          # User dashboard UI
      +page.server.ts       # Server-side data loading
```

## Tech Stack

- **Framework:** SvelteKit with TypeScript
- **Styling:** TailwindCSS with Neo-Brutalism design
- **Auth:** Spotify Authorization Code with PKCE
- **Session:** Secure HTTP-only cookies

## Next Steps

After MVP, the roadmap includes:
1. Image upload functionality
2. AI-powered mood extraction from images
3. Playlist generation based on image mood
4. Playlist sharing features

## Building

Create a production build:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```
