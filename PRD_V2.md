# PRD.md — Updated for Phase 2 (Post-MVP)

## 1. Product Overview
SonoLens is a multimodal, AI‑enhanced music exploration tool that converts visual inspiration into personalized Spotify playlists. The MVP (Phase 1) successfully implemented the Spotify Authorization Code Flow with PKCE, enabling secure user login.

Phase 2 expands SonoLens into a functional creative assistant where users can upload or capture images, receive AI‑generated mood insights, generate playlists, edit them dynamically, and preview tracks.

---

## 2. Vision
Enable users to express a mood, setting, or emotion through an image and instantly receive a curated playlist that they can edit, refine, and save to their Spotify library.

SonoLens aims to become the most intuitive “photo‑to‑playlist” generator with a bold neo‑brutalist aesthetic.

---

## 3. Phase 2 Goals
### Core Goals
- Accept image uploads from desktop and mobile
- Support mobile camera capture
- Analyze images with AI (Claude/OpenAI Vision)
- Convert mood & visual cues into playlist metadata
- Generate an editable playlist using Spotify’s Recommendation API
- Allow users to remove/replace tracks
- Provide alternative song suggestions
- Add a mini music player (preview clips via Spotify API)
- Enable saving the playlist to the user’s Spotify account

### Stretch Goals
- Save image + analysis history
- Support multiple images blended into a playlist
- Allow regenerating full playlist
- Export/share playlist visuals

---

## 4. User Stories
### Uploading & Analysis
- **As a user**, I want to upload a photo or take one with my phone so the system can analyze its vibe.
- **As a user**, I want AI to interpret the image’s mood, colors, and atmosphere.

### Playlist Creation
- **As a user**, I want SonoLens to generate a playlist matching the mood.

### Playlist Editing
- **As a user**, I want to remove songs I don’t like.
- **As a user**, I want alternative tracks automatically suggested.
- **As a user**, I want to reorder tracks (stretch).

### Playback
- **As a user**, I want to preview songs directly in the app.

### Saving
- **As a user**, I want to save the final playlist to my Spotify account.

---

## 5. Functional Requirements
### Image Upload
- Accept JPG, PNG, WebP
- Support mobile camera (`capture="environment"`)
- Provide preview UI

### AI Image Analysis
- Extract mood, color palette, energy, emotional tags
- Suggest seed genres, artists, keywords for Spotify
- Return structured JSON

### Playlist Generator
- Use Spotify Recommendations API
- Create playlist with ~20 tracks
- Auto-title playlist based on mood

### Playlist Editor
- Remove track
- Replace track
- Show alternatives (3–5 tracks)
- Drag & drop reorder (stretch)

### Mini Player
- Use Spotify Web Playback SDK where applicable
- For non-Premium users: fallback preview (`preview_url`)

### Save Playlist
- Create playlist in user’s Spotify account
- Add selected tracks

---

## 6. Non‑Functional Requirements
- Responsive (desktop/mobile)
- Fast analysis (< 4 seconds per image + AI)
- Secure token handling via SvelteKit server routes
- Clean neo‑brutalist visual design

---

## 7. Architecture Summary (Phase 2)
```
Frontend (SvelteKit)
  |-> Upload image
  |-> Camera capture
  |-> Playlist editor & mini player
      ↓
Backend (SvelteKit API routes)
  |-> /api/analyze-image
  |-> /api/spotify/recommend
  |-> /api/spotify/replace-track
  |-> /api/spotify/create-playlist
      ↓
AI Model (Claude/OpenAI Vision)
  |-> Mood analysis
      ↓
Spotify Web API
  |-> Generate tracks
  |-> Save playlist
```

---

## 8. Technical Stack
- **Frontend:** SvelteKit + Typescript + Tailwind CSS + Neo‑Brutalism UI
- **Backend:** SvelteKit server endpoints
- **AI Models:** OpenAI GPT-4o Vision
- **Auth:** Spotify PKCE (already implemented in MVP)
- **Playback:** Spotify Web Playback SDK + `preview_url` fallback
- **Optional Storage:** Supabase or S3

---

## 9. Success Criteria (Phase 2)
- User can upload/take a photo
- AI analysis returns reliable mood data
- Playlist is generated and editable
- User can replace tracks with alternatives
- Mini player works for most users
- Playlist can be saved to Spotify

---

## 10. Risks
- Spotify track previews limited (Premium may be required)
- AI interpretation may vary
- Mobile camera permissions differ by OS
- Spotify API rate limits

---

