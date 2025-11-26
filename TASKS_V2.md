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
- [x] Add Spotify recommendation functions to `src/lib/spotify.ts`
- [x] Implement seed-based recommendation logic
- [x] Map AI mood data to Spotify parameters (genres, energy, valence, etc.)
- [x] Add playlist-required scopes to auth (`playlist-modify-public`, `playlist-modify-private`)

### Playlist Generation Endpoint
- [x] Create `/api/spotify/recommend/+server.ts` endpoint
- [x] Accept mood analysis data as input
- [x] Call Spotify Recommendations API
- [x] Return ~20 tracks with full metadata
- [x] Handle errors (insufficient seeds, API limits)

### Generated Playlist UI
- [x] Create playlist display component
- [x] Show track list with album art, title, artist
- [x] Add track numbers
- [x] Display playlist title from AI analysis
- [x] Style with neo-brutalist design

---

## ✏️ Milestone 5 — Playlist Editing ✅ COMPLETED

### Edit Functionality
- [x] Add remove track button to each track
- [x] Implement track removal logic (client-side state)
- [x] Add drag-and-drop reordering functionality
- [x] Visual feedback during drag operations
- [~~] ~~Add "Replace Track" functionality~~ (REMOVED - recommendations endpoint deprecated)
- [~~] ~~Show loading state while fetching replacements~~ (REMOVED)

### Drag-and-Drop Reordering
- [x] Add drag handles to track items
- [x] Implement HTML5 drag-and-drop event handlers
- [x] Visual feedback (opacity, blue highlight on drag-over)
- [x] Update track order state on drop
- [x] Maintain currently playing track when reordering
- [x] Add ARIA roles for accessibility

### Replacement Suggestions Endpoint
- [~~] ~~Create `/api/spotify/suggest-replacements/+server.ts` endpoint~~ (REMOVED - recommendations endpoint deprecated)
- [~~] ~~Accept removed track + mood context~~ (REMOVED)
- [~~] ~~Fetch 5 alternative tracks~~ (REMOVED)
- [~~] ~~Return suggestions with metadata~~ (REMOVED)

### Replacement UI
- [~~] ~~Create track replacement modal~~ (REMOVED)
- [~~] ~~Display alternative track suggestions~~ (REMOVED)
- [~~] ~~Add "Use This Track" button for each suggestion~~ (REMOVED)
- [~~] ~~Update playlist state on selection~~ (REMOVED)
- [~~] ~~Close modal after selection~~ (REMOVED)

**Note:** Track replacement functionality was removed because the Spotify `/recommendations` endpoint is deprecated. Users can remove and reorder tracks in generated playlists.

---

## 🎧 Milestone 6 — Mini Audio Player ✅ COMPLETED

### Player Integration
- [x] Research Spotify Web Playback SDK requirements
- [x] Add `streaming` scope to auth if needed
- [x] Create audio player component
- [x] Implement preview_url fallback for non-Premium users
- [x] Add play/pause controls
- [x] Show currently playing track
- [x] Style with neo-brutalist design

### Player State Management
- [x] Track current playing position in playlist
- [x] Handle track switching
- [x] Add keyboard controls (space for play/pause)
- [x] Handle preview expiration (30s clips)

---

## 💾 Milestone 7 — Save Playlist to Spotify ✅ COMPLETED

### Create Playlist Endpoint
- [x] Create `/api/spotify/create-playlist/+server.ts` endpoint
- [x] Accept playlist title and track URIs
- [x] Create playlist in user's Spotify account
- [x] Add tracks to playlist
- [x] Return playlist URL and ID

### Save Playlist UI
- [x] Add "Save to Spotify" button
- [x] Show success message with Spotify link
- [x] Handle errors (duplicate names, API limits)
- [x] Add option to make playlist public/private
- [x] Redirect to dashboard or show success state

---

## 🎨 Milestone 8 — UI/UX Polish ✅ COMPLETED

### Visual Enhancements
- [x] Create consistent loading states
- [x] Add animations for track removal/addition
- [x] Improve mobile responsiveness
- [x] Add empty states (no tracks, failed analysis)
- [x] Create error boundaries (via error displays)

### User Flow Optimization
- [x] Add breadcrumb or progress indicator
- [x] Implement "Start Over" functionality
- [x] Add help text/tooltips
- [x] Improve accessibility (ARIA labels, keyboard nav)

### Components Created
- [x] LoadingSpinner component for consistent loading UI
- [x] EmptyState component for better empty state handling
- [x] ProgressIndicator component for step-by-step flow visualization
- [x] Tooltip component for contextual help (created but not yet integrated)
- [x] Smooth animations using Svelte transitions (fly, fade)

---

## 🧪 Milestone 9 — Testing & Error Handling (Phase 1 ✅ COMPLETED)

### Unit and UI testing
- [x] Configure Vitest
- [x] Add tests for PKCE utilities (13 tests)
- [x] Add tests for image utilities (22 tests)
- [x] Add tests for AI image analysis validation
- [x] Create comprehensive test documentation
- [ ] Set up mocks for Spotify API
- [ ] Add tests for recommendations builder
- [ ] Add integration tests for /api/spotify/recommend
- [ ] Configure playwright and add tests


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
