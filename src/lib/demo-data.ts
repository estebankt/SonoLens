import type { SpotifyTrack, MoodAnalysis } from './types/phase2';

export const DEMO_USER = {
	id: 'demo',
	display_name: 'Demo User',
	email: 'demo@sonolens.app',
	images: [] as Array<{ url: string }>
};

export const DEMO_MOOD_ANALYSIS: MoodAnalysis = {
	mood_tags: ['energetic', 'vibrant', 'summer', 'happy'],
	energy_level: 'high',
	emotional_descriptors: ['excited', 'uplifted', 'carefree'],
	atmosphere: 'A sunny afternoon at a beach club with friends.',
	recommended_genres: ['Pop', 'Synthpop', 'Indie Pop', 'Nu-Disco'],
	seed_tracks: [
		'Blinding Lights - The Weeknd',
		'Midnight City - M83',
		'Get Lucky - Daft Punk',
		'As It Was - Harry Styles',
		'Levitating - Dua Lipa',
		'Walking On Sunshine - Katrina & The Waves',
		"Can't Stop The Feeling! - Justin Timberlake",
		'Watermelon Sugar - Harry Styles',
		'Electric Feel - MGMT',
		'Safe And Sound - Capital Cities'
	],
	suggested_playlist_title: 'Sunny Vibes & Neon Lights',
	confidence_score: 0.95
};

export const DEMO_TRACKS: SpotifyTrack[] = [
	{
		id: '0VjIjW4GlUZAMYd2vXMi3b',
		uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b',
		name: 'Blinding Lights',
		artists: [
			{
				id: '1Xyo4u8uXC1ZmMpatF05PJ',
				name: 'The Weeknd',
				uri: 'spotify:artist:1Xyo4u8uXC1ZmMpatF05PJ'
			}
		],
		album: {
			id: '4yP0hdKOZPNshxUOjY0cZj',
			name: 'After Hours',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b273ef017e899c0547a1e8b01af6',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 200040,
		preview_url: null,
		external_urls: { spotify: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b' },
		popularity: 87
	},
	{
		id: '2374M0fQpWi3dLnB54qaLX',
		uri: 'spotify:track:2374M0fQpWi3dLnB54qaLX',
		name: 'Africa',
		artists: [
			{ id: '0LyfQWLjkoeNMLfgnQm73L', name: 'Toto', uri: 'spotify:artist:0LyfQWLjkoeNMLfgnQm73L' }
		],
		album: {
			id: '1bnHPO8CqBjrFiNvuQJxdp',
			name: 'Toto IV',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b273bdddc6a24f826f66a40cdb2e',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 295893,
		preview_url: null,
		external_urls: { spotify: 'https://open.spotify.com/track/2374M0fQpWi3dLnB54qaLX' },
		popularity: 82
	},
	{
		id: '1zwMYTA5nlNjZxYrvBB2pV',
		uri: 'spotify:track:1zwMYTA5nlNjZxYrvBB2pV',
		name: 'Lose Yourself',
		artists: [
			{ id: '7dGJo4pcD2V6oG8kP0tJRR', name: 'Eminem', uri: 'spotify:artist:7dGJo4pcD2V6oG8kP0tJRR' }
		],
		album: {
			id: '6tkjU4Umpo79wwkgPMV3rq',
			name: '8 Mile Soundtrack',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b273f8c5bdb7ae25f5fb2d0dd498',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 326933,
		preview_url: null,
		external_urls: { spotify: 'https://open.spotify.com/track/1zwMYTA5nlNjZxYrvBB2pV' },
		popularity: 84
	},
	{
		id: '2Foc5Q5nqNiosCNqttzHof',
		uri: 'spotify:track:2Foc5Q5nqNiosCNqttzHof',
		name: 'Get Lucky',
		artists: [
			{
				id: '4tZwfgrHOc3mvqYlEYSvVi',
				name: 'Daft Punk',
				uri: 'spotify:artist:4tZwfgrHOc3mvqYlEYSvVi'
			},
			{
				id: '4OMMPkgjse5dGX0emf5oET',
				name: 'Pharrell Williams',
				uri: 'spotify:artist:4OMMPkgjse5dGX0emf5oET'
			}
		],
		album: {
			id: '2noRn2Aes5aoNVsU6iWThc',
			name: 'Random Access Memories',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b2739b9b36b0e22870b9f541355c',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 248893,
		preview_url: null,
		external_urls: { spotify: 'https://open.spotify.com/track/2Foc5Q5nqNiosCNqttzHof' },
		popularity: 81
	},
	{
		id: '7qiZfU4dY1lWllzX7mPBI3',
		uri: 'spotify:track:7qiZfU4dY1lWllzX7mPBI3',
		name: 'Shape of You',
		artists: [
			{
				id: '6eUKZXaKkcviH0Ku9w2n3V',
				name: 'Ed Sheeran',
				uri: 'spotify:artist:6eUKZXaKkcviH0Ku9w2n3V'
			}
		],
		album: {
			id: '3T4tUhGYeRNVUGevb0wThu',
			name: '÷ (Divide)',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b2734bf58c2e8a7bc04e7ef4d8e4',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 233713,
		preview_url: null,
		external_urls: { spotify: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3' },
		popularity: 83
	},
	{
		id: '3AJwUDP919kvQ9QcozQPxg',
		uri: 'spotify:track:3AJwUDP919kvQ9QcozQPxg',
		name: 'Someone Like You',
		artists: [
			{ id: '4dpARuHxo51G3z768sgnrY', name: 'Adele', uri: 'spotify:artist:4dpARuHxo51G3z768sgnrY' }
		],
		album: {
			id: '3qsP9ZDJLY7r3BXh4U7Dg3',
			name: '21',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b273d3f406228e5fa1b18b7b1441',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 285373,
		preview_url: null,
		external_urls: { spotify: 'https://open.spotify.com/track/3AJwUDP919kvQ9QcozQPxg' },
		popularity: 80
	},
	{
		id: '7tFiyTwD0nx5a1eklYtX2J',
		uri: 'spotify:track:7tFiyTwD0nx5a1eklYtX2J',
		name: 'bad guy',
		artists: [
			{
				id: '6qqNVTkY8uBg9cP3Jd7DAH',
				name: 'Billie Eilish',
				uri: 'spotify:artist:6qqNVTkY8uBg9cP3Jd7DAH'
			}
		],
		album: {
			id: '0S0KGZnfBGSIssfF54WSJh',
			name: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 194088,
		preview_url: null,
		external_urls: { spotify: 'https://open.spotify.com/track/7tFiyTwD0nx5a1eklYtX2J' },
		popularity: 82
	},
	{
		id: '0ofHAoxe9vBkTCp2UQIavz',
		uri: 'spotify:track:0ofHAoxe9vBkTCp2UQIavz',
		name: 'Redbone',
		artists: [
			{
				id: '73sIBHcqh3Z3NyqHKZ7FOL',
				name: 'Childish Gambino',
				uri: 'spotify:artist:73sIBHcqh3Z3NyqHKZ7FOL'
			}
		],
		album: {
			id: '5CCpCEYxv9UEVWqPYWBkYU',
			name: 'Awaken, My Love!',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b2736f2fd7cb4a33f6b5f4d84dd0',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 326940,
		preview_url: null,
		external_urls: { spotify: 'https://open.spotify.com/track/0ofHAoxe9vBkTCp2UQIavz' },
		popularity: 76
	},
	{
		id: '0RiRZpuVRbi7oqHtVZLnBJ',
		uri: 'spotify:track:0RiRZpuVRbi7oqHtVZLnBJ',
		name: 'Mr. Brightside',
		artists: [
			{
				id: '0C0XlULifJtAgn6ZNCW2eu',
				name: 'The Killers',
				uri: 'spotify:artist:0C0XlULifJtAgn6ZNCW2eu'
			}
		],
		album: {
			id: '6TJmQnO44YE5BtTxH8pop1',
			name: 'Hot Fuss',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b2737b08f83e5e5f5b7f6b4fe9d0',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 222200,
		preview_url: null,
		external_urls: { spotify: 'https://open.spotify.com/track/0RiRZpuVRbi7oqHtVZLnBJ' },
		popularity: 79
	},
	{
		id: '3GCdLUSnKSMJhs4Tj6CV3s',
		uri: 'spotify:track:3GCdLUSnKSMJhs4Tj6CV3s',
		name: 'Clocks',
		artists: [
			{
				id: '4gzpq5DPGxSnKTe4SA8HAU',
				name: 'Coldplay',
				uri: 'spotify:artist:4gzpq5DPGxSnKTe4SA8HAU'
			}
		],
		album: {
			id: '0RHX9XECH8IgPgICROxYcL',
			name: 'A Rush of Blood to the Head',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b273de3c04b5fc750b68899b20a9',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 307640,
		preview_url: null,
		external_urls: { spotify: 'https://open.spotify.com/track/3GCdLUSnKSMJhs4Tj6CV3s' },
		popularity: 77
	},
	{
		id: '5UqCQaDshqbIk3pkly4Se1',
		uri: 'spotify:track:5UqCQaDshqbIk3pkly4Se1',
		name: 'Midnight City',
		artists: [
			{ id: '0L8ExT028jH3ddEcZwqJJ5', name: 'M83', uri: 'spotify:artist:0L8ExT028jH3ddEcZwqJJ5' }
		],
		album: {
			id: '6eFtZxm5YqxBvHBMRn7h2K',
			name: "Hurry Up, We're Dreaming",
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b273eb510e2724dca25c3c338ba5',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 244000,
		preview_url: null,
		external_urls: { spotify: 'https://open.spotify.com/track/5UqCQaDshqbIk3pkly4Se1' },
		popularity: 74
	},
	{
		id: '4LRPiXqCikLlN15c3yImP7',
		uri: 'spotify:track:4LRPiXqCikLlN15c3yImP7',
		name: 'As It Was',
		artists: [
			{
				id: '6KImCVD70vtIoJWnq6nGn3',
				name: 'Harry Styles',
				uri: 'spotify:artist:6KImCVD70vtIoJWnq6nGn3'
			}
		],
		album: {
			id: '5r36AJ6VOJtp00oxSkBZ5h',
			name: "Harry's House",
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0',
					height: 640,
					width: 640
				}
			]
		},
		duration_ms: 167303,
		preview_url: null,
		external_urls: { spotify: 'https://open.spotify.com/track/4LRPiXqCikLlN15c3yImP7' },
		popularity: 85
	}
];

export const DEMO_TOP_ARTISTS = [
	{
		id: '4LEiUm1SRbFMgfqnQTwUbQ',
		name: 'Bon Iver',
		external_urls: { spotify: 'https://open.spotify.com/artist/4LEiUm1SRbFMgfqnQTwUbQ' },
		images: [
			{
				url: 'https://i.scdn.co/image/ab6761610000e5eb8ae7f2aaa9817a704a87ea36',
				height: 640,
				width: 640
			},
			{
				url: 'https://i.scdn.co/image/ab6761610000f178c0b45b3d5a5a2c4f8f7c8b92',
				height: 64,
				width: 64
			}
		],
		genres: ['indie folk', 'chamber pop'],
		popularity: 75
	},
	{
		id: '1Xyo4u8uXC1ZmMpatF05PJ',
		name: 'The Weeknd',
		external_urls: { spotify: 'https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ' },
		images: [
			{
				url: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb',
				height: 640,
				width: 640
			},
			{
				url: 'https://i.scdn.co/image/ab6761610000f1780a6a4c2c3e7ca02eb1a5f2f4',
				height: 64,
				width: 64
			}
		],
		genres: ['canadian contemporary r&b', 'pop'],
		popularity: 92
	},
	{
		id: '4tZwfgrHOc3mvqYlEYSvVi',
		name: 'Daft Punk',
		external_urls: { spotify: 'https://open.spotify.com/artist/4tZwfgrHOc3mvqYlEYSvVi' },
		images: [
			{
				url: 'https://i.scdn.co/image/ab6761610000e5eb5c2c2e6f5a0a0c4b5e5f5a0a',
				height: 640,
				width: 640
			},
			{
				url: 'https://i.scdn.co/image/ab6761610000f1785c2c2e6f5a0a0c4b5e5f5a0a',
				height: 64,
				width: 64
			}
		],
		genres: ['electronic', 'french house'],
		popularity: 80
	},
	{
		id: '6qqNVTkY8uBg9cP3Jd7DAH',
		name: 'Billie Eilish',
		external_urls: { spotify: 'https://open.spotify.com/artist/6qqNVTkY8uBg9cP3Jd7DAH' },
		images: [
			{
				url: 'https://i.scdn.co/image/ab6761610000e5eb5c48bbf8f6b7a9a2a2b2c2d2',
				height: 640,
				width: 640
			},
			{
				url: 'https://i.scdn.co/image/ab6761610000f1785c48bbf8f6b7a9a2a2b2c2d2',
				height: 64,
				width: 64
			}
		],
		genres: ['pop', 'electropop'],
		popularity: 88
	}
];

export const DEMO_TOP_TRACKS = [
	{
		id: '0VjIjW4GlUZAMYd2vXMi3b',
		name: 'Blinding Lights',
		artists: [{ id: '1Xyo4u8uXC1ZmMpatF05PJ', name: 'The Weeknd' }],
		album: {
			id: '4yP0hdKOZPNshxUOjY0cZj',
			name: 'After Hours',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b273ef017e899c0547a1e8b01af6',
					height: 640,
					width: 640
				},
				{
					url: 'https://i.scdn.co/image/ab67616d00004851ef017e899c0547a1e8b01af6',
					height: 64,
					width: 64
				}
			]
		},
		external_urls: { spotify: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b' },
		duration_ms: 200040,
		popularity: 87
	},
	{
		id: '7tFiyTwD0nx5a1eklYtX2J',
		name: 'bad guy',
		artists: [{ id: '6qqNVTkY8uBg9cP3Jd7DAH', name: 'Billie Eilish' }],
		album: {
			id: '0S0KGZnfBGSIssfF54WSJh',
			name: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e',
					height: 640,
					width: 640
				},
				{
					url: 'https://i.scdn.co/image/ab67616d000048512a038d3bf875d23e4aeaa84e',
					height: 64,
					width: 64
				}
			]
		},
		external_urls: { spotify: 'https://open.spotify.com/track/7tFiyTwD0nx5a1eklYtX2J' },
		duration_ms: 194088,
		popularity: 82
	},
	{
		id: '2Foc5Q5nqNiosCNqttzHof',
		name: 'Get Lucky',
		artists: [{ id: '4tZwfgrHOc3mvqYlEYSvVi', name: 'Daft Punk' }],
		album: {
			id: '2noRn2Aes5aoNVsU6iWThc',
			name: 'Random Access Memories',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b2739b9b36b0e22870b9f541355c',
					height: 640,
					width: 640
				},
				{
					url: 'https://i.scdn.co/image/ab67616d000048519b9b36b0e22870b9f541355c',
					height: 64,
					width: 64
				}
			]
		},
		external_urls: { spotify: 'https://open.spotify.com/track/2Foc5Q5nqNiosCNqttzHof' },
		duration_ms: 248893,
		popularity: 81
	},
	{
		id: '3GCdLUSnKSMJhs4Tj6CV3s',
		name: 'Clocks',
		artists: [{ id: '4gzpq5DPGxSnKTe4SA8HAU', name: 'Coldplay' }],
		album: {
			id: '0RHX9XECH8IgPgICROxYcL',
			name: 'A Rush of Blood to the Head',
			images: [
				{
					url: 'https://i.scdn.co/image/ab67616d0000b273de3c04b5fc750b68899b20a9',
					height: 640,
					width: 640
				},
				{
					url: 'https://i.scdn.co/image/ab67616d00004851de3c04b5fc750b68899b20a9',
					height: 64,
					width: 64
				}
			]
		},
		external_urls: { spotify: 'https://open.spotify.com/track/3GCdLUSnKSMJhs4Tj6CV3s' },
		duration_ms: 307640,
		popularity: 77
	}
];

export const DEMO_RECENTLY_PLAYED = [
	{
		track: {
			id: '4LRPiXqCikLlN15c3yImP7',
			name: 'As It Was',
			artists: [{ id: '6KImCVD70vtIoJWnq6nGn3', name: 'Harry Styles' }],
			album: {
				id: '5r36AJ6VOJtp00oxSkBZ5h',
				name: "Harry's House",
				images: [
					{
						url: 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0',
						height: 640,
						width: 640
					},
					{
						url: 'https://i.scdn.co/image/ab67616d000048512e8ed79e177ff6011076f5f0',
						height: 64,
						width: 64
					}
				]
			},
			external_urls: { spotify: 'https://open.spotify.com/track/4LRPiXqCikLlN15c3yImP7' },
			duration_ms: 167303
		},
		played_at: '2026-02-25T10:00:00Z'
	},
	{
		track: {
			id: '0ofHAoxe9vBkTCp2UQIavz',
			name: 'Redbone',
			artists: [{ id: '73sIBHcqh3Z3NyqHKZ7FOL', name: 'Childish Gambino' }],
			album: {
				id: '5CCpCEYxv9UEVWqPYWBkYU',
				name: 'Awaken, My Love!',
				images: [
					{
						url: 'https://i.scdn.co/image/ab67616d0000b2736f2fd7cb4a33f6b5f4d84dd0',
						height: 640,
						width: 640
					},
					{
						url: 'https://i.scdn.co/image/ab67616d000048516f2fd7cb4a33f6b5f4d84dd0',
						height: 64,
						width: 64
					}
				]
			},
			external_urls: { spotify: 'https://open.spotify.com/track/0ofHAoxe9vBkTCp2UQIavz' },
			duration_ms: 326940
		},
		played_at: '2026-02-25T09:30:00Z'
	},
	{
		track: {
			id: '5UqCQaDshqbIk3pkly4Se1',
			name: 'Midnight City',
			artists: [{ id: '0L8ExT028jH3ddEcZwqJJ5', name: 'M83' }],
			album: {
				id: '6eFtZxm5YqxBvHBMRn7h2K',
				name: "Hurry Up, We're Dreaming",
				images: [
					{
						url: 'https://i.scdn.co/image/ab67616d0000b273eb510e2724dca25c3c338ba5',
						height: 640,
						width: 640
					},
					{
						url: 'https://i.scdn.co/image/ab67616d00004851eb510e2724dca25c3c338ba5',
						height: 64,
						width: 64
					}
				]
			},
			external_urls: { spotify: 'https://open.spotify.com/track/5UqCQaDshqbIk3pkly4Se1' },
			duration_ms: 244000
		},
		played_at: '2026-02-24T22:15:00Z'
	},
	{
		track: {
			id: '0RiRZpuVRbi7oqHtVZLnBJ',
			name: 'Mr. Brightside',
			artists: [{ id: '0C0XlULifJtAgn6ZNCW2eu', name: 'The Killers' }],
			album: {
				id: '6TJmQnO44YE5BtTxH8pop1',
				name: 'Hot Fuss',
				images: [
					{
						url: 'https://i.scdn.co/image/ab67616d0000b2737b08f83e5e5f5b7f6b4fe9d0',
						height: 640,
						width: 640
					},
					{
						url: 'https://i.scdn.co/image/ab67616d000048517b08f83e5e5f5b7f6b4fe9d0',
						height: 64,
						width: 64
					}
				]
			},
			external_urls: { spotify: 'https://open.spotify.com/track/0RiRZpuVRbi7oqHtVZLnBJ' },
			duration_ms: 222200
		},
		played_at: '2026-02-24T20:00:00Z'
	}
];
