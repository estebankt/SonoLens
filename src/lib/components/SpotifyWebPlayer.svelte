<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { SpotifyTrack } from '$lib/types/phase2';

	interface SpotifyWebPlayerProps {
		tracks: SpotifyTrack[];
		currentTrackIndex?: number;
		onTrackChange?: (index: number) => void;
		autoPlay?: boolean; // Auto-play first track when ready
	}

	let {
		tracks,
		currentTrackIndex = 0,
		onTrackChange,
		autoPlay = false
	}: SpotifyWebPlayerProps = $props();

	// Player state
	let player = $state<Spotify.Player | null>(null);
	let deviceId = $state<string | null>(null);
	let isReady = $state(false);
	let isPlaying = $state(false);
	let isPremium = $state(true); // Assume premium initially
	let currentPosition = $state(0);
	let duration = $state(0);
	let currentIndex = $state(currentTrackIndex);
	let errorMessage = $state<string | null>(null);
	let isInitializing = $state(true);
	let volume = $state(0.5);
	let needsReauth = $state(false); // Indicates user needs to re-authenticate

	// Computed values
	let currentTrack = $derived(tracks[currentIndex] || null);
	let canPlayPrevious = $derived(currentIndex > 0);
	let canPlayNext = $derived(currentIndex < tracks.length - 1);

	// Update current index when prop changes and trigger playback
	$effect(() => {
		if (currentTrackIndex !== currentIndex) {
			currentIndex = currentTrackIndex;
			// Only auto-play if player is ready and we have a device
			if (isReady && deviceId && tracks[currentIndex]) {
				playTrackAtIndex(currentIndex);
			}
		}
	});

	// Notify parent when track changes
	$effect(() => {
		if (onTrackChange && currentIndex !== currentTrackIndex) {
			onTrackChange(currentIndex);
		}
	});

	// Load Spotify Web Playback SDK
	function loadSpotifySDK(): Promise<void> {
		return new Promise((resolve, reject) => {
			// Check if already loaded
			if (window.Spotify) {
				resolve();
				return;
			}

			// Create script element
			const script = document.createElement('script');
			script.src = 'https://sdk.scdn.co/spotify-player.js';
			script.async = true;

			// Setup callback for when SDK loads
			window.onSpotifyWebPlaybackSDKReady = () => {
				resolve();
			};

			script.onerror = () => {
				reject(new Error('Failed to load Spotify SDK'));
			};

			document.body.appendChild(script);
		});
	}

	// Get access token from server
	async function getAccessToken(): Promise<string> {
		try {
			const response = await fetch('/api/auth/check');
			const data = await response.json();

			if (data.authenticated && data.accessToken) {
				return data.accessToken;
			}

			throw new Error('Not authenticated');
		} catch (error) {
			console.error('Error getting access token:', error);
			throw error;
		}
	}

	// Initialize Spotify Web Playback SDK
	async function initializePlayer() {
		try {
			isInitializing = true;
			errorMessage = null;

			// Load SDK
			await loadSpotifySDK();

			// Get access token
			const token = await getAccessToken();

			// Create player instance
			player = new window.Spotify!.Player({
				name: 'SonoLens Web Player',
				getOAuthToken: async (cb) => {
					try {
						const token = await getAccessToken();
						cb(token);
					} catch (error) {
						console.error('Error refreshing token:', error);
					}
				},
				volume: volume
			});

			// Setup event listeners
			player.addListener('ready', ({ device_id }: Spotify.WebPlaybackInstance) => {
				console.log('✅ Spotify Player Ready! Device ID:', device_id);
				deviceId = device_id;
				isReady = true;
				isInitializing = false;

				// Auto-play the first track when player becomes ready (if enabled)
				if (autoPlay && tracks.length > 0 && currentIndex >= 0) {
					setTimeout(() => {
						playTrackAtIndex(currentIndex);
					}, 500); // Small delay to ensure device is fully registered
				}
			});

			player.addListener('not_ready', ({ device_id }: Spotify.WebPlaybackInstance) => {
				console.log('⚠️ Device ID has gone offline', device_id);
				isReady = false;
			});

			player.addListener('player_state_changed', (state: Spotify.PlaybackState | null) => {
				if (!state) return;

				isPlaying = !state.paused;
				currentPosition = state.position;
				duration = state.duration;

				// Auto-play next track when current ends
				if (state.position === 0 && state.paused && state.track_window.previous_tracks.length > 0) {
					if (canPlayNext) {
						playNext();
					}
				}
			});

			player.addListener('initialization_error', ({ message }: Spotify.Error) => {
				console.error('❌ Initialization Error:', message);
				errorMessage = 'Failed to initialize player. Please try refreshing the page.';
				isInitializing = false;
			});

			player.addListener('authentication_error', ({ message }: Spotify.Error) => {
				console.error('❌ Authentication Error:', message);

				// Check if it's a scope issue
				if (message.toLowerCase().includes('scope')) {
					errorMessage =
						'Missing required permissions. Please log out and log in again to enable playback.';
					needsReauth = true;
				} else {
					errorMessage = 'Authentication failed. Please try logging in again.';
				}

				isInitializing = false;
			});

			player.addListener('account_error', ({ message }: Spotify.Error) => {
				console.error('❌ Account Error:', message);
				errorMessage = 'Spotify Premium required. Please upgrade your account to use playback.';
				isPremium = false;
				isInitializing = false;
			});

			player.addListener('playback_error', ({ message }: Spotify.Error) => {
				console.error('❌ Playback Error:', message);
				errorMessage = `Playback error: ${message}`;
			});

			// Connect to player
			const connected = await player.connect();
			if (!connected) {
				throw new Error('Failed to connect player');
			}

			console.log('🎵 Spotify Web Player initialized successfully');
		} catch (error) {
			console.error('Error initializing player:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to initialize player';
			isInitializing = false;
		}
	}

	// Play track at specific index
	async function playTrackAtIndex(index: number) {
		if (!deviceId || !isReady || index < 0 || index >= tracks.length) {
			console.error('Cannot play track: player not ready or invalid index');
			return;
		}

		try {
			const token = await getAccessToken();
			const track = tracks[index];

			// Use Spotify Web API to start playback
			const response = await fetch(
				`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						uris: [track.uri]
					})
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				console.error('Playback error:', errorData);

				if (response.status === 403 && errorData.error?.reason === 'PREMIUM_REQUIRED') {
					isPremium = false;
					errorMessage = 'Spotify Premium required for playback';
				} else {
					errorMessage = `Failed to play track: ${errorData.error?.message || response.statusText}`;
				}
				return;
			}

			currentIndex = index;
			isPlaying = true;
			errorMessage = null;
		} catch (error) {
			console.error('Error playing track:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to play track';
		}
	}

	// Toggle play/pause
	async function togglePlayPause() {
		if (!player || !isReady) return;

		try {
			await player.togglePlay();
		} catch (error) {
			console.error('Error toggling playback:', error);
		}
	}

	// Play next track
	function playNext() {
		if (canPlayNext) {
			playTrackAtIndex(currentIndex + 1);
		}
	}

	// Play previous track
	function playPrevious() {
		if (canPlayPrevious) {
			playTrackAtIndex(currentIndex - 1);
		}
	}

	// Seek to position
	async function seek(position: number) {
		if (!player || !isReady) return;

		try {
			await player.seek(position);
		} catch (error) {
			console.error('Error seeking:', error);
		}
	}

	// Set volume
	async function setVolume(newVolume: number) {
		volume = newVolume;

		if (!deviceId || !isReady) return;

		try {
			// Use Web API for more reliable volume control
			const token = await getAccessToken();
			const volumePercent = Math.round(newVolume * 100);

			const response = await fetch(
				`https://api.spotify.com/v1/me/player/volume?volume_percent=${volumePercent}&device_id=${deviceId}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			if (!response.ok && response.status !== 204) {
				console.error('Failed to set volume:', response.statusText);
			}
		} catch (error) {
			console.error('Error setting volume:', error);
		}
	}

	// Handle seek bar input
	function handleSeek(event: Event) {
		const target = event.target as HTMLInputElement;
		const newPosition = parseInt(target.value);
		seek(newPosition);
	}

	// Handle volume change
	function handleVolumeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const newVolume = parseFloat(target.value);
		setVolume(newVolume);
	}

	// Keyboard controls
	function handleKeydown(event: KeyboardEvent) {
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			return;
		}

		switch (event.key) {
			case ' ':
			case 'k':
				event.preventDefault();
				togglePlayPause();
				break;
			case 'ArrowRight':
			case 'l':
				event.preventDefault();
				if (canPlayNext) playNext();
				break;
			case 'ArrowLeft':
			case 'j':
				event.preventDefault();
				if (canPlayPrevious) playPrevious();
				break;
			case 'm':
				event.preventDefault();
				setVolume(volume === 0 ? 0.5 : 0);
				break;
		}
	}

	// Format time
	function formatTime(ms: number): string {
		const seconds = Math.floor(ms / 1000);
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Update position every second while playing
	let positionInterval: number;
	$effect(() => {
		if (isPlaying) {
			positionInterval = window.setInterval(async () => {
				if (player && isReady) {
					const state = await player.getCurrentState();
					if (state) {
						currentPosition = state.position;
					}
				}
			}, 1000);
		} else {
			if (positionInterval) {
				clearInterval(positionInterval);
			}
		}

		return () => {
			if (positionInterval) {
				clearInterval(positionInterval);
			}
		};
	});

	// Initialize on mount
	onMount(() => {
		initializePlayer();
	});

	// Cleanup on destroy
	onDestroy(() => {
		if (player) {
			player.disconnect();
		}
		if (positionInterval) {
			clearInterval(positionInterval);
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="neo-card bg-black text-white sticky bottom-0 z-50">
	<div class="p-4">
		{#if isInitializing}
			<!-- Loading state -->
			<div class="text-center py-4">
				<div
					class="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"
				></div>
				<p class="text-sm">Initializing Spotify Player...</p>
			</div>
		{:else if errorMessage}
			<!-- Error state -->
			<div class="text-center py-4">
				<p class="text-red-400 mb-2">⚠️ {errorMessage}</p>
				{#if needsReauth}
					<!-- Scope/Permission error - needs re-authentication -->
					<p class="text-sm text-gray-400 mb-3">
						The playback feature requires additional permissions. Please log out and log back in to
						grant the required permissions.
					</p>
					<div class="flex gap-3 justify-center">
						<a href="/auth/logout" class="neo-button bg-red-500 text-white border-red-700 text-sm">
							Log Out & Re-authenticate
						</a>
						<button onclick={initializePlayer} class="neo-button bg-white text-black text-sm">
							Retry
						</button>
					</div>
				{:else if !isPremium}
					<!-- Premium required error -->
					<p class="text-sm text-gray-400 mb-3">
						Web playback requires Spotify Premium. You can still save playlists and open tracks in
						Spotify.
					</p>
					<a
						href="https://www.spotify.com/premium/"
						target="_blank"
						rel="noopener noreferrer"
						class="neo-button bg-green-500 text-white border-green-700 text-sm inline-block"
					>
						Upgrade to Premium
					</a>
				{:else}
					<!-- Generic error -->
					<button onclick={initializePlayer} class="neo-button bg-white text-black text-sm">
						Retry
					</button>
				{/if}
			</div>
		{:else if !currentTrack}
			<!-- No track selected -->
			<div class="text-center text-gray-400">
				<p>No track selected</p>
			</div>
		{:else if isReady && !isPlaying && currentPosition === 0}
			<!-- Ready to play - show play prompt -->
			<div class="text-center py-4">
				<p class="text-lg mb-3">Ready to play</p>
				<p class="text-gray-400 mb-4">Click play to start listening</p>
				<button
					onclick={() => playTrackAtIndex(currentIndex)}
					class="neo-button bg-green-500 text-white border-green-700 text-lg px-8 py-4"
				>
					▶️ Start Playing
				</button>
			</div>
		{:else}
			<!-- Player controls -->
			<div class="flex items-center gap-4 mb-3">
				<!-- Album art -->
				{#if currentTrack.album.images[0]}
					<img
						src={currentTrack.album.images[0].url}
						alt={currentTrack.album.name}
						class="w-16 h-16 border-4 border-white"
					/>
				{/if}

				<!-- Track details -->
				<div class="flex-1 min-w-0">
					<p class="font-bold text-lg truncate">{currentTrack.name}</p>
					<p class="text-gray-300 truncate">
						{currentTrack.artists.map((a) => a.name).join(', ')}
					</p>
					{#if !isReady}
						<p class="text-yellow-400 text-sm">Connecting to Spotify...</p>
					{/if}
				</div>

				<!-- Volume control -->
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
							clip-rule="evenodd"
						/>
					</svg>
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={volume}
						oninput={handleVolumeChange}
						disabled={!isReady}
						class="w-20 h-2"
					/>
				</div>
			</div>

			<!-- Progress bar -->
			<div class="mb-3">
				<input
					type="range"
					min="0"
					max={duration}
					value={currentPosition}
					oninput={handleSeek}
					disabled={!isReady}
					class="w-full h-2 bg-white border-2 border-white appearance-none cursor-pointer disabled:opacity-50"
				/>
				<div class="flex justify-between text-xs text-gray-400 mt-1">
					<span>{formatTime(currentPosition)}</span>
					<span>{formatTime(duration)}</span>
				</div>
			</div>

			<!-- Controls -->
			<div class="flex items-center justify-center gap-3">
				<!-- Previous button -->
				<button
					onclick={playPrevious}
					disabled={!canPlayPrevious || !isReady}
					class="p-3 bg-white text-black border-4 border-white hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
					title="Previous (J or ←)"
				>
					<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
						<path
							d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"
						/>
					</svg>
				</button>

				<!-- Play/Pause button -->
				<button
					onclick={togglePlayPause}
					disabled={!isReady}
					class="p-4 bg-white text-black border-4 border-white hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
					title={isPlaying ? 'Pause (Space or K)' : 'Play (Space or K)'}
				>
					{#if isPlaying}
						<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
					{:else}
						<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
				</button>

				<!-- Next button -->
				<button
					onclick={playNext}
					disabled={!canPlayNext || !isReady}
					class="p-3 bg-white text-black border-4 border-white hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
					title="Next (L or →)"
				>
					<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
						<path
							d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"
						/>
					</svg>
				</button>
			</div>

			<!-- Keyboard shortcuts hint -->
			<div class="text-center text-xs text-gray-500 mt-3">
				<p>
					Keyboard: <span class="text-gray-400">Space/K = Play/Pause</span> •
					<span class="text-gray-400">J/← = Previous</span> •
					<span class="text-gray-400">L/→ = Next</span> •
					<span class="text-gray-400">M = Mute</span>
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		background: white;
		outline: none;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		background: black;
		border: 3px solid white;
		cursor: pointer;
	}

	input[type='range']::-moz-range-thumb {
		width: 20px;
		height: 20px;
		background: black;
		border: 3px solid white;
		cursor: pointer;
	}

	input[type='range']:disabled::-webkit-slider-thumb {
		cursor: not-allowed;
	}

	input[type='range']:disabled::-moz-range-thumb {
		cursor: not-allowed;
	}
</style>
