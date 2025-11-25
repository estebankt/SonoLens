# CLAUDE.md — Updated for Phase 2 (Post‑MVP)

## 1. Purpose
This document guides Claude Code (via Claude CLI) through Phase 2 of SonoLens development. The MVP is complete—Spotify authentication using PKCE works. Phase 2 focuses on image upload, AI mood analysis, playlist generation, playlist editing, and playback functionality.

Claude’s role is to:
- Implement new features incrementally
- Maintain architecture consistency
- Keep the neo‑brutalist aesthetic
- Ensure SvelteKit routes and server logic are clean & secure
- Verify tasks against `TASKS_V2.md`
- Avoid rewriting or breaking MVP functionality

---

## 2. Scope for Claude
Claude should support the following areas:

### Phase 2 Feature Areas
1. **Image Upload & Camera Capture**
2. **AI Image Processing (Claude/OpenAI Vision)**
3. **Track Recommendations & Playlist Generation**
4. **Playlist Editing UI & Logic**
5. **Song Replacement Suggestions**
6. **Mini Audio Player Integration**
7. **Saving Playlists to Spotify**

---

## 3. Development Guidelines
### General
- Use **SvelteKit + Typescript**
- Maintain a **neo‑brutalist design** using Tailwind CSS
- Preserve PKCE auth logic already implemented
- Use SvelteKit **server routes** for sensitive operations
- Use the existing folder structure unless improvements are needed
- Keep code modular (e.g., `/lib/server/spotify.ts`)

### Claude Code Best Practices
- Always begin major changes in **Planning Mode**
- Reference `TASKS_V2.md` for to‑dos and check them off
- Ask before deleting or refactoring core files
- Suggest missing components only when needed
- Use small, incremental PR‑like changes to avoid breaking state

---

## 4. Feature‑Specific Guidelines

### 4.1 Image Upload
- Implement via `<input type="file" accept="image/*" capture="environment">`
- No storage required for MVP
- Process file via `POST /api/analyze-image`
- Validate file size & type

### 4.2 Camera Capture (Optional Advanced)
- Use `getUserMedia()`
- Capture a frame into `<canvas>` → Blob

### 4.3 AI Image Analysis
- Use OpenAI GPT-4o Vision
- Return well‑structured JSON:
  - mood tags
  - color palette
  - energy level
  - environment descriptors
  - recommended genres
  - seed artist/track suggestions
  - suggested playlist title

### 4.4 Playlist Generation
- Map AI output → Spotify’s Recommendation API
- Generate ~20 tracks
- Store working playlist client‑side

### 4.5 Playlist Editing
- Allow:
  - Remove track
  - Request replacement
  - Reorder (optional later)
- Show analysis summary at top

### 4.6 Replacement Track Suggestions
- Endpoint: `POST /api/suggest-replacements`
- Use removed track + mood vector to fetch alternatives

### 4.7 Mini Player
- Use Spotify Web Playback SDK when user has Premium
- Fallback: use `preview_url`

### 4.8 Save Playlist to Spotify
- Endpoint: `/api/spotify/create-playlist`
- Add finalized track URIs

---

## 5. File Conventions
### Server Endpoints
Place new routes under:
```
src/routes/api/
```
Example endpoints:
```
/api/analyze-image/+server.ts
/api/spotify/recommend/+server.ts
/api/spotify/replace-track/+server.ts
/api/spotify/create-playlist/+server.ts
```

### Libraries
Place reusable logic under:
```
src/lib/server/spotify.ts
src/lib/server/ai.ts
```

### Components
Place UI components under:
```
src/lib/components/
```

---

## 6. When Claude Should Ask for Clarification
Claude must ask the user before:
- Adding new dependencies
- Introducing new storage or a database
- Refactoring auth logic
- Changing file structures
- Modifying Tailwind theme

---

## 7. Out of Scope
Claude should not:
- Create unrelated features
- Implement ML models locally
- Build fully custom media players beyond Spotify SDK capabilities

---

## 8. Success Definition
Claude has successfully completed Phase 2 when:
- Users can upload or capture an image
- AI returns meaningful mood data
- Playlists are generated accurately
- Tracks can be edited and replaced
- Song previews work
- Finalized playlists can be saved to Spotify
- No MVP functionality is broken

---

## 9. Reference Documents
Claude should actively reference:
- `PRD.md` (this document)
- `TASKS_V2.md`
- `PLANNING.md`
- SvelteKit docs
- Spotify Web API docs

---

## 10. Session Instructions
When using Claude CLI with this repo:
- Start with `/plan`
- Use smaller tasks from `TASKS_V2.md`
- Keep diffs minimal and readable
- Confirm assumptions before implementing large features
- Always test locally when possible

---

