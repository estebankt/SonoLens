import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserProfile, createPlaylist, addTracksToPlaylist } from '$lib/spotify';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// Check if user is authenticated
		const accessToken = cookies.get('spotify_access_token');
		if (!accessToken) {
			return json(
				{
					success: false,
					error: 'Unauthorized: Please log in to save playlists'
				},
				{ status: 401 }
			);
		}

		// Parse request body
		const body = await request.json();
		const { title, description, track_uris, is_public } = body;

		if (!title || !track_uris || !Array.isArray(track_uris) || track_uris.length === 0) {
			return json(
				{
					success: false,
					error: 'Missing required fields: title and track_uris'
				},
				{ status: 400 }
			);
		}

		console.log('═══════════════════════════════════════════════════');
		console.log('💾 CREATING SPOTIFY PLAYLIST');
		console.log('═══════════════════════════════════════════════════');
		console.log('Title:', title);
		console.log('Description:', description || '(none)');
		console.log('Tracks:', track_uris.length);
		console.log('Public:', is_public ?? true);

		// Get user profile to get user ID
		const profile = await getUserProfile(accessToken);
		console.log('User ID:', profile.id);

		// Create the playlist
		const playlist = await createPlaylist(accessToken, profile.id, title, {
			description: description || 'Created with SonoLens - AI-powered playlist from image analysis',
			public: is_public ?? true
		});

		console.log('✓ Playlist created:', playlist.id);

		// Add tracks to the playlist
		await addTracksToPlaylist(accessToken, playlist.id, track_uris);

		console.log('✓ Tracks added to playlist');
		console.log('═══════════════════════════════════════════════════');
		console.log('✅ SUCCESS: Playlist saved to Spotify');
		console.log('Playlist URL:', playlist.external_urls.spotify);
		console.log('═══════════════════════════════════════════════════');

		return json({
			success: true,
			playlist: {
				id: playlist.id,
				name: playlist.name,
				url: playlist.external_urls.spotify,
				uri: playlist.uri
			}
		});
	} catch (error) {
		console.error('Error creating playlist:', error);

		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create playlist'
			},
			{ status: 500 }
		);
	}
};
