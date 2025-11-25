/**
 * Type definitions for Phase 2 features
 * Image analysis, playlist generation, and editing
 */

// AI Image Analysis Types
export interface MoodAnalysis {
	mood_tags: string[];
	color_palette: string[];
	energy_level: 'low' | 'medium' | 'high';
	emotional_descriptors: string[];
	atmosphere: string;
	recommended_genres: string[];
	seed_artists?: string[];
	seed_tracks?: string[];
	suggested_playlist_title: string;
	confidence_score?: number;
}

// Spotify Track Types (extended)
export interface SpotifyTrack {
	id: string;
	uri: string;
	name: string;
	artists: Array<{
		id: string;
		name: string;
		uri: string;
	}>;
	album: {
		id: string;
		name: string;
		images: Array<{
			url: string;
			height: number;
			width: number;
		}>;
	};
	duration_ms: number;
	preview_url: string | null;
	external_urls: {
		spotify: string;
	};
	popularity?: number;
}

// Playlist Types
export interface GeneratedPlaylist {
	title: string;
	tracks: SpotifyTrack[];
	mood_analysis: MoodAnalysis;
	created_at: string;
}

export interface SavedSpotifyPlaylist {
	id: string;
	name: string;
	external_urls: {
		spotify: string;
	};
	uri: string;
	snapshot_id: string;
}

// API Request/Response Types
export interface AnalyzeImageRequest {
	image: string; // base64 encoded image
	image_type: string; // mime type
}

export interface AnalyzeImageResponse {
	success: boolean;
	mood_analysis?: MoodAnalysis;
	error?: string;
}

export interface GeneratePlaylistRequest {
	mood_analysis: MoodAnalysis;
	limit?: number; // number of tracks, default 20
}

export interface GeneratePlaylistResponse {
	success: boolean;
	tracks?: SpotifyTrack[];
	error?: string;
}

export interface ReplaceTrackRequest {
	removed_track_id: string;
	mood_context: MoodAnalysis;
	current_track_ids: string[]; // to avoid duplicates
}

export interface ReplaceTrackResponse {
	success: boolean;
	suggestions?: SpotifyTrack[];
	error?: string;
}

export interface CreatePlaylistRequest {
	title: string;
	track_uris: string[];
	is_public?: boolean;
	description?: string;
}

export interface CreatePlaylistResponse {
	success: boolean;
	playlist?: SavedSpotifyPlaylist;
	error?: string;
}

// Image Upload Types
export interface ImageUploadState {
	file: File | null;
	preview_url: string | null;
	is_uploading: boolean;
	error: string | null;
}

// Playlist Editor State
export interface PlaylistEditorState {
	tracks: SpotifyTrack[];
	is_editing: boolean;
	selected_track_index: number | null;
	replacement_suggestions: SpotifyTrack[];
	is_fetching_replacements: boolean;
}
