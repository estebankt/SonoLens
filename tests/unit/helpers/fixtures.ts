/**
 * Test fixtures and sample data for testing
 */

import type { MoodAnalysis, SpotifyTrack } from '$lib/types/phase2';

/**
 * Sample mood analysis for testing
 */
export const mockMoodAnalysis: MoodAnalysis = {
	mood_tags: ['melancholic', 'dreamy', 'atmospheric'],
	energy_level: 'medium',
	emotional_descriptors: ['nostalgic', 'contemplative', 'serene'],
	atmosphere: 'A misty, introspective landscape that evokes quiet reflection',
	recommended_genres: ['indie', 'ambient', 'dream-pop'],
	seed_tracks: ['Nude - Radiohead', 'Holocene - Bon Iver', 'Breath - Pink Floyd'],
	suggested_playlist_title: 'Misty Reflections',
	confidence_score: 0.85
};

/**
 * High energy mood analysis for testing
 */
export const mockHighEnergyMoodAnalysis: MoodAnalysis = {
	mood_tags: ['energetic', 'upbeat', 'party', 'dance'],
	energy_level: 'high',
	emotional_descriptors: ['happy', 'excited', 'joyful'],
	atmosphere: 'A vibrant party atmosphere with pulsing energy',
	recommended_genres: ['dance', 'edm', 'pop'],
	seed_tracks: ["Don't Stop Me Now - Queen", 'September - Earth, Wind & Fire'],
	suggested_playlist_title: 'Energy Boost',
	confidence_score: 0.92
};

/**
 * Low energy mood analysis for testing
 */
export const mockLowEnergyMoodAnalysis: MoodAnalysis = {
	mood_tags: ['calm', 'peaceful', 'serene', 'ambient'],
	energy_level: 'low',
	emotional_descriptors: ['relaxed', 'content', 'tranquil'],
	atmosphere: 'A peaceful beach scene at sunset',
	recommended_genres: ['ambient', 'chillout', 'downtempo'],
	seed_tracks: ['Breathe - Pink Floyd', 'Weightless - Marconi Union'],
	suggested_playlist_title: 'Coastal Serenity',
	confidence_score: 0.88
};

/**
 * Sample Spotify track for testing
 */
export const mockSpotifyTrack: SpotifyTrack = {
	id: '6v3KW9xbzN5yKLt9YKDYA2',
	uri: 'spotify:track:6v3KW9xbzN5yKLt9YKDYA2',
	name: 'Holocene',
	artists: [
		{
			id: '4LEiUm1SRbFMgfqnQTwUbQ',
			name: 'Bon Iver',
			uri: 'spotify:artist:4LEiUm1SRbFMgfqnQTwUbQ'
		}
	],
	album: {
		id: '1JlvIsP2f9YnXi3u8IxrsK',
		name: 'Bon Iver',
		images: [
			{
				url: 'https://i.scdn.co/image/ab67616d0000b273c8b444df094279e70d0ed856',
				height: 640,
				width: 640
			}
		]
	},
	duration_ms: 338960,
	preview_url: 'https://p.scdn.co/mp3-preview/preview-url',
	external_urls: {
		spotify: 'https://open.spotify.com/track/6v3KW9xbzN5yKLt9YKDYA2'
	},
	popularity: 72
};

/**
 * Another sample Spotify track for testing
 */
export const mockSpotifyTrack2: SpotifyTrack = {
	id: '5ghIJDpPoe3CfHMGu71E6T',
	uri: 'spotify:track:5ghIJDpPoe3CfHMGu71E6T',
	name: 'Nude',
	artists: [
		{
			id: '4Z8W4fKeB5YxbusRsdQVPb',
			name: 'Radiohead',
			uri: 'spotify:artist:4Z8W4fKeB5YxbusRsdQVPb'
		}
	],
	album: {
		id: '5vkqYmiPBYLaalcmjujWxK',
		name: 'In Rainbows',
		images: [
			{
				url: 'https://i.scdn.co/image/ab67616d0000b2737a4781629469bb83356cd318',
				height: 640,
				width: 640
			}
		]
	},
	duration_ms: 254493,
	preview_url: 'https://p.scdn.co/mp3-preview/preview-url-2',
	external_urls: {
		spotify: 'https://open.spotify.com/track/5ghIJDpPoe3CfHMGu71E6T'
	},
	popularity: 68
};

/**
 * Sample Spotify user profile for testing
 */
export const mockUserProfile = {
	id: 'test-user-123',
	display_name: 'Test User',
	email: 'test@example.com',
	country: 'US',
	images: [
		{
			url: 'https://i.scdn.co/image/ab6775700000ee85user-image'
		}
	]
};

/**
 * Sample Spotify playlist response
 */
export const mockPlaylist = {
	id: 'playlist-123',
	name: 'Test Playlist',
	external_urls: {
		spotify: 'https://open.spotify.com/playlist/playlist-123'
	},
	uri: 'spotify:playlist:playlist-123',
	snapshot_id: 'snapshot-123'
};

/**
 * Sample Spotify token response
 */
export const mockTokenResponse = {
	access_token: 'mock-access-token-xyz',
	refresh_token: 'mock-refresh-token-xyz',
	expires_in: 3600
};

/**
 * Sample Spotify top artists response
 */
export const mockTopArtists = {
	items: [
		{
			id: '4LEiUm1SRbFMgfqnQTwUbQ',
			name: 'Bon Iver',
			images: [{ url: 'https://i.scdn.co/image/artist1', height: 640, width: 640 }],
			genres: ['indie folk', 'chamber pop'],
			popularity: 75,
			external_urls: { spotify: 'https://open.spotify.com/artist/4LEiUm1SRbFMgfqnQTwUbQ' }
		},
		{
			id: '4Z8W4fKeB5YxbusRsdQVPb',
			name: 'Radiohead',
			images: [{ url: 'https://i.scdn.co/image/artist2', height: 640, width: 640 }],
			genres: ['alternative rock', 'art rock'],
			popularity: 82,
			external_urls: { spotify: 'https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb' }
		}
	]
};

/**
 * Sample Spotify top tracks response
 */
export const mockTopTracks = {
	items: [mockSpotifyTrack, mockSpotifyTrack2]
};

/**
 * Sample Spotify recently played response
 */
export const mockRecentlyPlayed = {
	items: [
		{
			track: mockSpotifyTrack,
			played_at: '2025-01-15T12:34:56Z'
		},
		{
			track: mockSpotifyTrack2,
			played_at: '2025-01-15T11:20:30Z'
		}
	]
};

/**
 * Sample Spotify search response
 */
export const mockSearchResponse = {
	tracks: {
		items: [
			{
				id: mockSpotifyTrack.id,
				uri: mockSpotifyTrack.uri,
				name: mockSpotifyTrack.name,
				artists: mockSpotifyTrack.artists,
				album: mockSpotifyTrack.album,
				duration_ms: mockSpotifyTrack.duration_ms,
				preview_url: mockSpotifyTrack.preview_url,
				external_urls: mockSpotifyTrack.external_urls,
				popularity: mockSpotifyTrack.popularity
			}
		]
	}
};

/**
 * Sample Spotify artist search response
 */
export const mockArtistSearchResponse = {
	artists: {
		items: [
			{
				id: '4LEiUm1SRbFMgfqnQTwUbQ',
				name: 'Bon Iver'
			}
		]
	}
};

/**
 * Sample Spotify recommendations response
 */
export const mockRecommendationsResponse = {
	tracks: [
		{
			id: mockSpotifyTrack.id,
			uri: mockSpotifyTrack.uri,
			name: mockSpotifyTrack.name,
			artists: mockSpotifyTrack.artists,
			album: mockSpotifyTrack.album,
			duration_ms: mockSpotifyTrack.duration_ms,
			preview_url: mockSpotifyTrack.preview_url,
			external_urls: mockSpotifyTrack.external_urls,
			popularity: mockSpotifyTrack.popularity
		},
		{
			id: mockSpotifyTrack2.id,
			uri: mockSpotifyTrack2.uri,
			name: mockSpotifyTrack2.name,
			artists: mockSpotifyTrack2.artists,
			album: mockSpotifyTrack2.album,
			duration_ms: mockSpotifyTrack2.duration_ms,
			preview_url: mockSpotifyTrack2.preview_url,
			external_urls: mockSpotifyTrack2.external_urls,
			popularity: mockSpotifyTrack2.popularity
		}
	]
};

/**
 * Sample Spotify available genre seeds response
 */
export const mockGenreSeedsResponse = {
	genres: ['indie', 'ambient', 'pop', 'rock', 'jazz', 'classical']
};
