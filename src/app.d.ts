// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// Spotify Web Playback SDK Types
	interface Window {
		onSpotifyWebPlaybackSDKReady?: () => void;
		Spotify?: typeof Spotify;
	}

	namespace Spotify {
		interface Error {
			message: string;
		}

		interface PlayerInit {
			name: string;
			getOAuthToken: (cb: (token: string) => void) => void;
			volume?: number;
		}

		interface WebPlaybackInstance {
			device_id: string;
		}

		interface WebPlaybackState {
			context: {
				uri: string | null;
				metadata: any;
			};
			disallows: {
				pausing: boolean;
				peeking_next: boolean;
				peeking_prev: boolean;
				resuming: boolean;
				seeking: boolean;
				skipping_next: boolean;
				skipping_prev: boolean;
			};
			paused: boolean;
			position: number;
			repeat_mode: number;
			shuffle: boolean;
			duration: number;
			track_window: {
				current_track: WebPlaybackTrack;
				previous_tracks: WebPlaybackTrack[];
				next_tracks: WebPlaybackTrack[];
			};
		}

		interface WebPlaybackTrack {
			uri: string;
			id: string | null;
			type: 'track' | 'episode' | 'ad';
			media_type: 'audio' | 'video';
			name: string;
			is_playable: boolean;
			album: {
				uri: string;
				name: string;
				images: Array<{ url: string; height: number; width: number }>;
			};
			artists: Array<{ uri: string; name: string }>;
		}

		type PlaybackState = WebPlaybackState | null;

		interface Player {
			connect(): Promise<boolean>;
			disconnect(): void;
			addListener(event: 'ready', callback: (data: WebPlaybackInstance) => void): boolean;
			addListener(event: 'not_ready', callback: (data: WebPlaybackInstance) => void): boolean;
			addListener(event: 'player_state_changed', callback: (state: PlaybackState) => void): boolean;
			addListener(event: 'initialization_error', callback: (error: Error) => void): boolean;
			addListener(event: 'authentication_error', callback: (error: Error) => void): boolean;
			addListener(event: 'account_error', callback: (error: Error) => void): boolean;
			addListener(event: 'playback_error', callback: (error: Error) => void): boolean;
			removeListener(
				event:
					| 'ready'
					| 'not_ready'
					| 'player_state_changed'
					| 'initialization_error'
					| 'authentication_error'
					| 'account_error'
					| 'playback_error',
				callback?: (...args: any[]) => void
			): boolean;
			getCurrentState(): Promise<PlaybackState>;
			setName(name: string): Promise<void>;
			getVolume(): Promise<number>;
			setVolume(volume: number): Promise<void>;
			pause(): Promise<void>;
			resume(): Promise<void>;
			togglePlay(): Promise<void>;
			seek(position_ms: number): Promise<void>;
			previousTrack(): Promise<void>;
			nextTrack(): Promise<void>;
			activateElement(): Promise<void>;
		}

		const Player: {
			new (options: PlayerInit): Player;
		};
	}
}

export {};
