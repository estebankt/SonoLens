<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
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
	let showVolumeSlider = $state(false); // Show/hide volume dropdown
	let isExpanded = $state(false); // Player expansion state
	let previousVolume = $state(0.5); // For mute/unmute toggle

	// Computed values
	let currentTrack = $derived(tracks[currentIndex] || null);
	let canPlayPrevious = $derived(currentIndex > 0);
	let canPlayNext = $derived(currentIndex < tracks.length - 1);
	let volumeIcon = $derived(
		volume === 0 ? 'muted' : volume <= 0.33 ? 'low' : volume <= 0.66 ? 'medium' : 'high'
	);

	let previousTrackIndex = currentTrackIndex;

	// Update current index when prop changes and trigger playback
	$effect(() => {
		if (currentTrackIndex !== previousTrackIndex) {
			previousTrackIndex = currentTrackIndex;
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

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}

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
	async function togglePlayPause(e?: Event) {
		if (e) e.stopPropagation();
		if (!player || !isReady) return;

		try {
			await player.togglePlay();
		} catch (error) {
			console.error('Error toggling playback:', error);
		}
	}

	// Play next track
	function playNext(e?: Event) {
		if (e) e.stopPropagation();
		if (canPlayNext) {
			playTrackAtIndex(currentIndex + 1);
		}
	}

	// Play previous track
	function playPrevious(e?: Event) {
		if (e) e.stopPropagation();
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

	// Toggle volume slider dropdown
	function toggleVolumeSlider() {
		showVolumeSlider = !showVolumeSlider;
	}

	// Toggle mute/unmute
	function toggleMute() {
		if (volume === 0) {
			setVolume(previousVolume || 0.5);
		} else {
			previousVolume = volume;
			setVolume(0);
		}
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
			case 'M':
				event.preventDefault();
				toggleMute();
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

<svelte:window
	onkeydown={handleKeydown}
	onclick={(e) => {
		if (showVolumeSlider && !(e.target as Element)?.closest('.volume-control')) {
			showVolumeSlider = false;
		}
	}}
/>

{#if isExpanded}
	<!-- Expanded Player Overlay/Sheet -->
	<div
		class="fixed inset-0 bg-black/50 z-40"
		onclick={toggleExpanded}
		onkeydown={(e) => e.key === 'Escape' && toggleExpanded()}
		role="button"
		tabindex="0"
		aria-label="Close expanded player"
		transition:fly={{ duration: 200, opacity: 0 }}
	></div>
	<div
		class="fixed bottom-0 left-0 right-0 z-50 h-[90vh] bg-white border-t-4 border-black flex flex-col shadow-neo-lg"
		transition:fly={{ y: 1000, duration: 300, easing: cubicOut }}
	>
		<!-- Expanded Player Header -->
		<div class="flex items-center justify-between p-4 border-b-4 border-black bg-black text-white">
			<button onclick={toggleExpanded} class="p-2 hover:text-gray-300" aria-label="Collapse player">
				<svg
					class="w-8 h-8"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"
					></path>
				</svg>
			</button>
			<span class="font-bold text-lg">Now Playing</span>
			<div class="w-8"></div>
			<!-- Spacer for centering -->
		</div>

		<!-- Expanded Player Content -->
		<div class="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-white">
			{#if currentTrack}
				<!-- Large Album Art -->
				<div class="w-full max-w-sm aspect-square my-8 border-4 border-black shadow-neo-lg">
					{#if currentTrack.album.images[0]}
						<img
							src={currentTrack.album.images[0].url}
							alt={currentTrack.album.name}
							class="w-full h-full object-cover"
						/>
					{/if}
				</div>

				<!-- Track Info -->
				<div class="text-center mb-8 w-full">
					<h2 class="text-3xl font-bold mb-2 truncate">{currentTrack.name}</h2>
					<p class="text-xl text-gray-600 truncate">
						{currentTrack.artists.map((a) => a.name).join(', ')}
					</p>
				</div>

				<!-- Progress Bar -->
				<div class="w-full mb-8">
					<input
						type="range"
						min="0"
						max={duration}
						value={currentPosition}
						oninput={handleSeek}
						disabled={!isReady}
						class="w-full h-4 bg-white border-4 border-black appearance-none cursor-pointer disabled:opacity-50"
					/>
					<div class="flex justify-between text-sm font-bold mt-2">
						<span>{formatTime(currentPosition)}</span>
						<span>{formatTime(duration)}</span>
					</div>
				</div>

				<!-- Controls -->
				<div class="flex items-center justify-center gap-6 mb-8 w-full">
					<button
						onclick={playPrevious}
						disabled={!canPlayPrevious || !isReady}
						class="p-4 neo-button bg-white text-black hover:bg-gray-100 disabled:opacity-50"
						aria-label="Previous track"
					>
						<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
							<path
								d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"
							/>
						</svg>
					</button>

					<button
						onclick={togglePlayPause}
						disabled={!isReady}
						class="p-6 neo-button bg-yellow-400 text-black hover:translate-y-1 hover:shadow-none disabled:opacity-50 rounded-full border-4 border-black shadow-neo"
						aria-label={isPlaying ? 'Pause' : 'Play'}
					>
						{#if isPlaying}
							<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
									clip-rule="evenodd"
								/>
							</svg>
						{:else}
							<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
									clip-rule="evenodd"
								/>
							</svg>
						{/if}
					</button>

					<button
						onclick={playNext}
						disabled={!canPlayNext || !isReady}
						class="p-4 neo-button bg-white text-black hover:bg-gray-100 disabled:opacity-50"
						aria-label="Next track"
					>
						<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
							<path
								d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"
							/>
						</svg>
					</button>

					<!-- Volume Control -->
					<div class="volume-control relative">
						<!-- Icon Button (Always Visible) -->
						<button
							onclick={toggleVolumeSlider}
							aria-label="Volume control"
							aria-expanded={showVolumeSlider}
							class="p-4 neo-button bg-white text-black hover:bg-gray-100 transition-colors"
						>
							{#if volumeIcon === 'muted'}
								<!-- Muted SVG: Speaker with X -->
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
									<path
										d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
									/>
								</svg>
							{:else if volumeIcon === 'low'}
								<!-- Low Volume: Speaker with 1 wave -->
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
									<path
										d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 7.757a1 1 0 00-1.414 1.415A1.999 1.999 0 0114 11a1.999 1.999 0 01-.757 1.828 1 1 0 001.414 1.415A3.999 3.999 0 0016 11a3.999 3.999 0 00-1.343-3.243z"
									/>
								</svg>
							{:else if volumeIcon === 'medium'}
								<!-- Medium Volume: Speaker with 2 waves -->
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
									<path
										d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM11.828 7.757a1 1 0 011.415 0 5.983 5.983 0 010 8.485 1 1 0 01-1.415-1.414A3.984 3.984 0 0013 11a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
									/>
								</svg>
							{:else}
								<!-- High Volume: Speaker with 3 waves -->
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
									<path
										d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
									/>
								</svg>
							{/if}
						</button>

						<!-- Dropdown Slider (Conditional) -->
						{#if showVolumeSlider}
							<div
								transition:fly={{ y: 10, duration: 200 }}
								onclick={(e) => e.stopPropagation()}
								onkeydown={(e) => e.stopPropagation()}
								role="group"
								aria-label="Volume control slider"
								class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-60 bg-white border-4 border-black shadow-neo-lg p-6 w-[80px] h-[140px] flex items-center justify-center"
							>
								<!-- Vertical Slider Container -->
								<div class="flex items-center justify-center w-full h-full">
									<input
										type="range"
										min="0"
										max="1"
										step="0.01"
										value={volume}
										oninput={handleVolumeChange}
										class="volume-slider-vertical"
										style="--volume-percent: {volume * 100}%"
										aria-label="Volume percentage"
										aria-valuemin="0"
										aria-valuemax="100"
										aria-valuenow={Math.round(volume * 100)}
									/>
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<!-- Minimized Bottom Bar Player -->
	<div
		class="fixed bottom-0 left-0 right-0 z-50 bg-black text-white border-t-4 border-black cursor-pointer hover:bg-gray-900 transition-colors"
		onclick={toggleExpanded}
		onkeydown={(e) => e.key === 'Enter' && toggleExpanded()}
		role="button"
		tabindex="0"
		aria-label="Expand player"
	>
		<div class="p-3 sm:p-4 max-w-screen-xl mx-auto flex items-center gap-3 sm:gap-4">
			{#if isInitializing}
				<div class="flex-1 text-center">
					<p class="text-sm">Initializing Player...</p>
				</div>
			{:else if errorMessage}
				<div class="flex-1 text-center text-red-400">
					<p class="text-sm truncate">{errorMessage}</p>
				</div>
			{:else if !currentTrack}
				<div class="flex-1 text-center text-gray-400">
					<p class="text-sm">No track selected</p>
				</div>
			{:else}
				<!-- Album Art (Small) -->
				{#if currentTrack.album.images[0]}
					<img
						src={currentTrack.album.images[0].url}
						alt={currentTrack.album.name}
						class="w-10 h-10 sm:w-12 sm:h-12 border-2 border-white"
					/>
				{/if}

				<!-- Track Info -->
				<div class="flex-1 min-w-0">
					<p class="font-bold text-sm sm:text-base truncate">{currentTrack.name}</p>
					<p class="text-gray-300 text-xs sm:text-sm truncate">
						{currentTrack.artists.map((a) => a.name).join(', ')}
					</p>
				</div>

				<!-- Quick Controls -->
				<div class="flex items-center gap-2 sm:gap-4">
					<button
						onclick={togglePlayPause}
						class="p-2 text-white hover:text-yellow-400 transition-colors"
						aria-label={isPlaying ? 'Pause' : 'Play'}
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

					<!-- Expand Button -->
					<button class="p-2 text-white hover:text-gray-300" aria-label="Expand player">
						<svg
							class="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 15l7-7 7 7"
							></path>
						</svg>
					</button>
				</div>
			{/if}
		</div>
		<!-- Progress Bar (Thin line at top of minimized player) -->
		{#if duration > 0}
			<div class="absolute top-0 left-0 right-0 h-1 bg-gray-800">
				<div
					class="h-full bg-yellow-400 transition-all duration-1000 ease-linear"
					style="width: {(currentPosition / duration) * 100}%"
				></div>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Progress bar styles (existing) */
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

	/* Vertical Volume Slider - Using transform rotation */
	.volume-slider-vertical {
		-webkit-appearance: none;
		appearance: none;
		width: 120px; /* This becomes the height after rotation */
		height: 20px; /* This becomes the width after rotation (includes border) */
		box-sizing: border-box;
		background: linear-gradient(
			to right,
			#fbbf24 0%,
			#fbbf24 var(--volume-percent),
			white var(--volume-percent),
			white 100%
		);
		border: 4px solid black;
		border-radius: 0;
		outline: none;
		cursor: pointer;
		transform: rotate(-90deg);
		transform-origin: center;
	}

	/* WebKit (Chrome, Safari) slider track */
	.volume-slider-vertical::-webkit-slider-runnable-track {
		width: 120px;
		height: 12px; /* Inner height (without border) */
		background: linear-gradient(
			to right,
			#fbbf24 0%,
			#fbbf24 var(--volume-percent),
			white var(--volume-percent),
			white 100%
		);
		border: none;
	}

	/* WebKit slider thumb - Hidden */
	.volume-slider-vertical::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 0;
		height: 0;
		background: transparent;
		border: none;
		cursor: pointer;
	}

	.volume-slider-vertical::-webkit-slider-thumb:active {
		cursor: pointer;
	}

	/* Firefox slider track */
	.volume-slider-vertical::-moz-range-track {
		width: 120px;
		height: 12px;
		background: linear-gradient(
			to right,
			#fbbf24 0%,
			#fbbf24 var(--volume-percent),
			white var(--volume-percent),
			white 100%
		);
		border: none;
	}

	/* Firefox slider thumb - Hidden */
	.volume-slider-vertical::-moz-range-thumb {
		width: 0;
		height: 0;
		background: transparent;
		border: none;
		cursor: pointer;
	}

	.volume-slider-vertical::-moz-range-thumb:active {
		cursor: pointer;
	}
</style>
