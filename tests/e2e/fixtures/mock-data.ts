import type { MoodAnalysis, SpotifyTrack } from '$lib/types/phase2';

/**
 * Mock mood analysis data for E2E tests
 * Represents a calm, introspective mood typical of a serene landscape image
 */
export const MOCK_MOOD_ANALYSIS: MoodAnalysis = {
	mood_tags: ['calm', 'melancholic', 'dreamy'],
	energy_level: 'low',
	emotional_descriptors: ['peaceful', 'introspective', 'nostalgic'],
	atmosphere: 'serene and contemplative',
	recommended_genres: ['ambient', 'indie folk', 'downtempo'],
	seed_tracks: [
		'Holocene by Bon Iver',
		'Re: Stacks by Bon Iver',
		'Skinny Love by Bon Iver',
		'Breathe Me by Sia',
		'Mad World by Gary Jules',
		'The Night We Met by Lord Huron',
		'Lost in My Mind by The Head and the Heart',
		'To Build a Home by The Cinematic Orchestra'
	],
	suggested_playlist_title: 'Serene Reflections',
	confidence_score: 0.92
};

/**
 * Mock Spotify tracks for E2E tests
 * Full 20-track playlist matching the calm/introspective mood
 */
export const MOCK_TRACKS: SpotifyTrack[] = [
	{
		id: '4AyQ5GVjobMjZfir4RX1BO',
		uri: 'spotify:track:4AyQ5GVjobMjZfir4RX1BO',
		name: 'Holocene',
		artists: [
			{
				id: '4LEiUm1SRbFMgfqnQTwUbQ',
				name: 'Bon Iver',
				uri: 'spotify:artist:4LEiUm1SRbFMgfqnQTwUbQ'
			}
		],
		album: {
			id: '1JlvIsP2f9xEeUhx0ldUvz',
			name: 'Bon Iver',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b273bcd6c5bf773cdea0c9f4f4d8',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 337000,
		preview_url: 'https://p.scdn.co/mp3-preview/mock-holocene',
		external_urls: {
			spotify: 'https://open.spotify.com/track/4AyQ5GVjobMjZfir4RX1BO'
		},
		popularity: 75
	},
	{
		id: '3b7wpiVuaCoyYE5',
		uri: 'spotify:track:3b7wpiVuaCoyYE5',
		name: 'Re: Stacks',
		artists: [
			{
				id: '4LEiUm1SRbFMgfqnQTwUbQ',
				name: 'Bon Iver',
				uri: 'spotify:artist:4LEiUm1SRbFMgfqnQTwUbQ'
			}
		],
		album: {
			id: '0xtIlPsjZOd5NWv0TgVfWM',
			name: 'For Emma, Forever Ago',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b2732a0bce7e6a3bbefbbf31d15f',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 393000,
		preview_url: 'https://p.scdn.co/mp3-preview/mock-restacks',
		external_urls: {
			spotify: 'https://open.spotify.com/track/3b7wpiVuaCoyYE5'
		},
		popularity: 68
	},
	{
		id: '4Cy1EhvhgQOx',
		uri: 'spotify:track:4Cy1EhvhgQOx',
		name: 'Breathe Me',
		artists: [
			{
				id: '5WUlDfRSoLAfcVSX1',
				name: 'Sia',
				uri: 'spotify:artist:5WUlDfRSoLAfcVSX1'
			}
		],
		album: {
			id: '5Nbi85MsB6gqaX',
			name: 'Colour the Small One',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b27362f3f45f2db09f2ee0e5d9e0',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 270000,
		preview_url: null,
		external_urls: {
			spotify: 'https://open.spotify.com/track/4Cy1EhvhgQOx'
		},
		popularity: 72
	},
	{
		id: '3JOVTQ5h8HGFnNdh',
		uri: 'spotify:track:3JOVTQ5h8HGFnNdh',
		name: 'Mad World',
		artists: [
			{
				id: '5TgQ66WuWkoQ30',
				name: 'Gary Jules',
				uri: 'spotify:artist:5TgQ66WuWkoQ30'
			}
		],
		album: {
			id: '0f3MfwpAZ8TQr1',
			name: 'Trading Snakeoil for Wolftickets',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b273a74e9f2d96f6f6ec7f4f7f9f',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 189000,
		preview_url: 'https://p.scdn.co/mp3-preview/mock-madworld',
		external_urls: {
			spotify: 'https://open.spotify.com/track/3JOVTQ5h8HGFnNdh'
		},
		popularity: 80
	},
	{
		id: '7K8xU',
		uri: 'spotify:track:7K8xU',
		name: 'The Night We Met',
		artists: [
			{
				id: '7A6N3',
				name: 'Lord Huron',
				uri: 'spotify:artist:7A6N3'
			}
		],
		album: {
			id: '2K9R1',
			name: 'Strange Trails',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b273c4f7e7e7e7e7e7e7e7e7e7e7',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 207000,
		preview_url: 'https://p.scdn.co/mp3-preview/mock-thenightwemet',
		external_urls: {
			spotify: 'https://open.spotify.com/track/7K8xU'
		},
		popularity: 85
	}
];

/**
 * Mock user profile for dashboard tests
 */
export const MOCK_USER_PROFILE = {
	id: 'test-user-id',
	display_name: 'Test User',
	email: 'test@example.com',
	images: [
		{
			url: 'https://i.scdn.co/image/mock-user-avatar',
			height: 300,
			width: 300
		}
	],
	followers: {
		total: 42
	},
	product: 'premium'
};

/**
 * Mock saved playlist response
 */
export const MOCK_SAVED_PLAYLIST = {
	id: 'test-playlist-id-' + Date.now(),
	name: 'Serene Reflections',
	external_urls: {
		spotify: 'https://open.spotify.com/playlist/test-playlist-id'
	},
	uri: 'spotify:playlist:test-playlist-id',
	snapshot_id: 'test-snapshot-id'
};

/**
 * Mock top artists response
 */
export const MOCK_TOP_ARTISTS = {
	items: [
		{
			id: '4LEiUm1SRbFMgfqnQTwUbQ',
			name: 'Bon Iver',
			external_urls: { spotify: 'https://open.spotify.com/artist/4LEiUm1SRbFMgfqnQTwUbQ' },
			images: [{ url: 'https://i.scdn.co/image/mock-artist-image', height: 640, width: 640 }],
			genres: ['indie folk', 'chamber pop']
		}
	]
};

/**
 * Mock top tracks response
 */
export const MOCK_TOP_TRACKS = {
	items: [
		{
			id: '4AyQ5GVjobMjZfir4RX1BO',
			name: 'Holocene',
			artists: [{ name: 'Bon Iver' }],
			album: {
				name: 'Bon Iver',
				images: [{ url: 'https://i.scdn.co/image/mock-track-image', height: 640, width: 640 }]
			},
			external_urls: { spotify: 'https://open.spotify.com/track/4AyQ5GVjobMjZfir4RX1BO' }
		}
	]
};

/**
 * Mock recently played response
 */
export const MOCK_RECENTLY_PLAYED = {
	items: [
		{
			track: {
				id: '3JOVTQ5h8HGFnNdh',
				name: 'Mad World',
				artists: [{ name: 'Gary Jules' }],
				album: {
					name: 'Trading Snakeoil',
					images: [{ url: 'https://i.scdn.co/image/mock-recent-image', height: 640, width: 640 }]
				},
				external_urls: { spotify: 'https://open.spotify.com/track/3JOVTQ5h8HGFnNdh' }
			},
			played_at: '2025-01-01T12:00:00Z'
		}
	]
};
