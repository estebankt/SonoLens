# TASKS_V2.md — Phase 2 Task Breakdown

A detailed breakdown of all tasks required to build Phase 2 of **SonoLens**, organized into clear milestones for iterative delivery.

---

## 🎯 Phase 2 Overview
Phase 2 transforms SonoLens from an authentication-only MVP into a functional photo-to-playlist generator with AI mood analysis, playlist editing, and playback capabilities.

---

## 📋 Milestone 1 — Project Structure & Dependencies

### Setup Phase 2 Infrastructure
- [x] Review and update project dependencies
- [x] Add AI SDK dependencies (OpenAI SDK)
- [x] Create folder structure for Phase 2 (`src/routes/api/`, `src/lib/server/ai.ts`)
- [x] Update environment variables template for AI API keys
- [x] Create types file for Phase 2 data structures (mood analysis, playlist data)

---

## 🖼️ Milestone 2 — Image Upload & Camera Capture

### Image Upload Component
- [x] Create image upload page/route (`/create` or `/upload`)
- [x] Build file input component with image preview
- [x] Add file validation (JPG, PNG, WebP, max 10MB)
- [x] Implement mobile camera capture support (`capture="environment"`)
- [x] Add loading states and error handling
- [x] Style with neo-brutalist design

### Image Processing Utilities
- [x] Create image processing utilities in `src/lib/utils/image.ts`
- [x] Add image compression/resizing if needed
- [x] Convert image to base64 or appropriate format for AI

---

## 🤖 Milestone 3 — AI Image Analysis

### AI Integration Setup
- [x] Create `src/lib/server/ai.ts` for AI integration
- [x] Implement OpenAI GPT-4o Vision integration
- [x] Design structured prompt for mood/atmosphere analysis
- [x] Define JSON response schema (mood, colors, energy, genres, etc.)

### Analysis Endpoint
- [x] Create `/api/analyze-image/+server.ts` endpoint
- [x] Handle image upload and validation
- [x] Call AI service with image
- [x] Parse and validate AI response
- [x] Return structured mood data to client
- [x] Add error handling and logging

### Analysis UI
- [x] Create mood analysis results component
- [x] Display mood tags, colors, energy level
- [x] Show suggested playlist title
- [x] Add "Generate Playlist" button
- [x] Style with neo-brutalist cards

---

## 🎵 Milestone 4 — Spotify Playlist Generation

### Spotify Recommendation Helpers
- [ ] Add Spotify recommendation functions to `src/lib/spotify.ts`
- [ ] Implement seed-based recommendation logic
- [ ] Map AI mood data to Spotify parameters (genres, energy, valence, etc.)
- [ ] Add playlist-required scopes to auth (`playlist-modify-public`, `playlist-modify-private`)

### Playlist Generation Endpoint
- [ ] Create `/api/spotify/recommend/+server.ts` endpoint
- [ ] Accept mood analysis data as input
- [ ] Call Spotify Recommendations API
- [ ] Return ~20 tracks with full metadata
- [ ] Handle errors (insufficient seeds, API limits)

### Generated Playlist UI
- [ ] Create playlist display component
- [ ] Show track list with album art, title, artist
- [ ] Add track numbers
- [ ] Display playlist title from AI analysis
- [ ] Style with neo-brutalist design

---

## ✏️ Milestone 5 — Playlist Editing

### Edit Functionality
- [ ] Add remove track button to each track
- [ ] Implement track removal logic (client-side state)
- [ ] Add "Replace Track" functionality
- [ ] Show loading state while fetching replacements

### Replacement Suggestions Endpoint
- [ ] Create `/api/spotify/suggest-replacements/+server.ts` endpoint
- [ ] Accept removed track + mood context
- [ ] Fetch 3-5 alternative tracks
- [ ] Return suggestions with metadata

### Replacement UI
- [ ] Create track replacement modal/drawer
- [ ] Display alternative track suggestions
- [ ] Add "Use This Track" button for each suggestion
- [ ] Update playlist state on selection
- [ ] Close modal after selection

---

## 🎧 Milestone 6 — Mini Audio Player

### Player Integration
- [ ] Research Spotify Web Playback SDK requirements
- [ ] Add `streaming` scope to auth if needed
- [ ] Create audio player component
- [ ] Implement preview_url fallback for non-Premium users
- [ ] Add play/pause controls
- [ ] Show currently playing track
- [ ] Style with neo-brutalist design

### Player State Management
- [ ] Track current playing position in playlist
- [ ] Handle track switching
- [ ] Add keyboard controls (space for play/pause)
- [ ] Handle preview expiration (30s clips)

---

## 💾 Milestone 7 — Save Playlist to Spotify

### Create Playlist Endpoint
- [ ] Create `/api/spotify/create-playlist/+server.ts` endpoint
- [ ] Accept playlist title and track URIs
- [ ] Create playlist in user's Spotify account
- [ ] Add tracks to playlist
- [ ] Return playlist URL and ID

### Save Playlist UI
- [ ] Add "Save to Spotify" button
- [ ] Show success message with Spotify link
- [ ] Handle errors (duplicate names, API limits)
- [ ] Add option to make playlist public/private
- [ ] Redirect to dashboard or show success state

---

## 🎨 Milestone 8 — UI/UX Polish

### Visual Enhancements
- [ ] Create consistent loading states
- [ ] Add animations for track removal/addition
- [ ] Improve mobile responsiveness
- [ ] Add empty states (no tracks, failed analysis)
- [ ] Create error boundaries

### User Flow Optimization
- [ ] Add breadcrumb or progress indicator
- [ ] Implement "Start Over" functionality
- [ ] Add help text/tooltips
- [ ] Improve accessibility (ARIA labels, keyboard nav)

---

## 🧪 Milestone 9 — Testing & Error Handling

### Error Scenarios
- [ ] Handle AI analysis failures gracefully
- [ ] Handle Spotify API rate limits
- [ ] Handle expired tokens during long sessions
- [ ] Test with various image types and sizes
- [ ] Test edge cases (no recommendations found)

### User Testing
- [ ] Test complete flow on desktop
- [ ] Test complete flow on mobile
- [ ] Test camera capture on mobile devices
- [ ] Verify token refresh during playlist generation

---

## 🚀 Milestone 10 — Stretch Features (Optional)

### Advanced Features
- [ ] Save analysis history (requires database)
- [ ] Support multiple images for blended playlists
- [ ] Add "Regenerate Playlist" button
- [ ] Implement drag-and-drop track reordering
- [ ] Export playlist as image/shareable card
- [ ] Add playlist length customization (10, 20, 30 tracks)

---

## 🏁 Phase 2 Completion Criteria

- User can upload or capture an image
- AI successfully analyzes image and returns mood data
- Playlist is generated with ~20 relevant tracks
- User can remove and replace tracks
- Audio preview works for tracks
- User can save finalized playlist to Spotify
- Neo-brutalist UI is consistent
- Mobile experience is smooth
- MVP authentication still works

---
