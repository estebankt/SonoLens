# SonoLens 🎵👁️

![CI/CD Pipeline](https://github.com/estebankt/SonoLens/actions/workflows/ci.yml/badge.svg)

Live URL: https://sono-lens.vercel.app/

> **See the Vibe. Hear the Mood.**

SonoLens is a multimodal, AI-enhanced music exploration tool that converts visual inspiration into personalized Spotify playlists. By analyzing the mood, color palette, and atmosphere of an uploaded image using GPT-4o Vision, SonoLens curates a sonic experience that matches what you see.

Built with a bold **Neo-Brutalist** aesthetic, it is designed to be a functional and visually distinct creative assistant.

---

## 🚀 Project Overview

**Intention:**
Music and imagery are deeply connected. SonoLens aims to bridge the gap between visual and auditory senses (synesthesia), allowing users to generate soundtracks for their photos, art, or environments instantly. Whether you're capturing a rainy street, a vibrant party, or a quiet sunset, SonoLens finds the music that fits.

### Key Features
- **🔐 Secure Authentication:** Full Spotify OAuth 2.0 implementation using the PKCE flow (Proof Key for Code Exchange) for maximum security.
- **📸 Image Analysis:** Uses OpenAI's **GPT-4o Vision** to extract mood, energy, color theory, and descriptive keywords from any image.
- **🤖 AI-Powered Curation:** Translates visual data into specific Spotify audio features (valence, energy, danceability) and seed genres.
- **🎧 Interactive Playlist Generation:**
  - Generates ~20 track recommendations based on the analysis.
  - **Mini Player:** Preview tracks directly in the browser (30s clips or full playback for Premium).
  - **Editor:** Remove unwanted tracks or drag-and-drop to reorder the flow.
- **💾 Save to Spotify:** One-click export to save the curated playlist directly to your Spotify library.
- **📱 Responsive Design:** Fully functional on desktop and mobile (including camera capture support).

---

## 🛠️ Tech Stack

- **Framework:** [SvelteKit](https://kit.svelte.dev/) (Full-stack SSR/CSR)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Neo-Brutalism Theme)
- **AI:** [OpenAI API](https://platform.openai.com/) (GPT-4o Vision)
- **Music Data:** [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- **Testing:** [Vitest](https://vitest.dev/)
- **Deployment:** Vercel

---

## ⚙️ Prerequisites

Before you begin, you will need keys for the following services:

1.  **Spotify Developer Account:**
    *   Create an app in the [Spotify Dashboard](https://developer.spotify.com/dashboard).
    *   Set the Redirect URI to `http://127.0.0.1:5173/auth/callback` (for local dev).
    *   Note your `Client ID`.
2.  **OpenAI API Key:**
    *   Get an API key from [OpenAI Platform](https://platform.openai.com/).
    *   Ensure you have access to the `gpt-4o` model.

---

## 📥 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/sonolens.git
    cd sonolens
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory:
    ```bash
    cp .env.example .env
    ```
    Update it with your credentials:
    ```env
    # Spotify Configuration
    SPOTIFY_CLIENT_ID=your_spotify_client_id
    SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/auth/callback

    # OpenAI Configuration
    OPENAI_API_KEY=your_openai_api_key
    OPENAI_MODEL=gpt-4o
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Visit `http://127.0.0.1:5173` in your browser.

---

## 📖 Usage Examples

### 1. Authenticate
Click **"Login with Spotify"** on the home page. You will be redirected to Spotify to grant SonoLens permission to create playlists on your behalf.

### 2. Upload or Capture
Navigate to the **Create** page.
- **Desktop:** Drag and drop an image or click to browse.
- **Mobile:** Tap to take a photo of your surroundings or choose from your library.

### 3. Analyze & Generate
Once uploaded, the AI will analyze the image. You'll see a breakdown of the **Mood**, **Colors**, and **Energy**. Click **"Generate Playlist"** to fetch songs.

### 4. Edit & Preview
- **Preview:** Click the play button on any track to hear a snippet.
- **Reorder:** Drag tracks to change the flow of the playlist.
- **Remove:** Click the 'X' to remove tracks that don't fit the vibe.

### 5. Save
Click **"Save to Spotify"**. The playlist will appear in your Spotify account immediately, titled based on the AI's mood suggestion (e.g., *"Midnight Rain Vibes"*).

---

## 🔄 CI/CD Pipeline

This project implements a **production-grade CI/CD pipeline** using GitHub Actions with optimized performance and intelligent caching strategies.

### Pipeline Architecture

```
┌─────────────────────────────────────────────────┐
│  Feature Branch Push / Pull Request / Main Push │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │  Parallel Jobs  │
        ├────────┬────────┤
        │  Lint  │  Test  │  ← Run simultaneously (30-40% faster)
        └────┬───┴───┬────┘
             └───┬───┘
                 │
            ┌────▼────┐
            │  Build  │  ← Type check & build
            └────┬────┘
                 │
        ┌────────┴────────┐
        │                 │
    ┌───▼────┐      ┌────▼─────┐
    │ Preview│      │Production│  ← Conditional deployment
    │ Deploy │      │  Deploy  │
    └────────┘      └──────────┘
```

### Optimization Features

#### 1. **Parallel Job Execution**
Lint and test jobs run concurrently instead of sequentially, reducing total pipeline time by ~30-40%.

#### 2. **Intelligent Caching**
- **node_modules caching** via `actions/cache@v4` across all jobs
- Cache key based on `package-lock.json` hash
- Automatic cache invalidation when dependencies change
- Saves ~30-60 seconds per job on cache hits

#### 3. **Branch Coverage**
- **Feature branches:** Full CI checks (lint, test, build) without deployment
- **Pull Requests:** CI checks + preview deployment + automated PR comment
- **Main branch:** CI checks + production deployment

#### 4. **Centralized Configuration**
All test environment variables managed at workflow level for easier maintenance and consistency.

### Workflow Stages Explained

| Stage | Purpose | Runs On | Dependencies |
|-------|---------|---------|--------------|
| **Lint** | Code quality (Prettier, ESLint) | All branches | None |
| **Test** | Unit tests (Vitest) | All branches | None |
| **Build** | Type checking + SvelteKit build | All branches | Lint + Test |
| **Preview Deploy** | Vercel preview environment | PRs only | Build |
| **Production Deploy** | Live deployment | Main branch only | Build |

### Deployment Targets

-   **Preview:** Unique URL per PR, automatically commented on the pull request
-   **Production:** [https://sono-lens.vercel.app](https://sono-lens.vercel.app/)

### Manual Deployment

The workflow supports manual triggers for redeployments:
1. Navigate to **Actions** → **CI/CD Pipeline**
2. Click **Run workflow**
3. Select target environment (`preview` or `production`)

---

## 🤝 Contribution Guidelines

We welcome contributions! Whether it's fixing a bug, improving the UI, or adding new features.

1.  **Fork the Project**
2.  **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3.  **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4.  **Run Tests** (`npm test`) to ensure nothing broke.
5.  **Push to the Branch** (`git push origin feature/AmazingFeature`)
6.  **Open a Pull Request**

### Development Scripts
- `npm run dev`: Start dev server.
- `npm run check`: Check TypeScript types.
- `npm run test`: Run unit tests via Vitest.
- `npm run format`: Format code with Prettier.
- `npm run lint`: Run ESLint.

---

## 📄 License

This project is currently unlicensed (Private).
*Contact the maintainer for usage permissions.*

---

*Built with 🖤 by Mario Guillen, with lots of coffee.*
