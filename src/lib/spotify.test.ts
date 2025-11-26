import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateCodeVerifier, generateCodeChallenge, getAuthorizationUrl } from './spotify';

describe('PKCE Utilities', () => {
	describe('generateCodeVerifier', () => {
		it('should generate a code verifier with default length of 128', () => {
			const verifier = generateCodeVerifier();
			expect(verifier).toBeDefined();
			expect(verifier.length).toBe(128);
		});

		it('should generate a code verifier with custom length', () => {
			const verifier = generateCodeVerifier(64);
			expect(verifier.length).toBe(64);
		});

		it('should only contain URL-safe characters', () => {
			const verifier = generateCodeVerifier();
			// PKCE spec allows: A-Z, a-z, 0-9, -, ., _, ~
			const urlSafeRegex = /^[A-Za-z0-9\-._~]+$/;
			expect(verifier).toMatch(urlSafeRegex);
		});

		it('should generate unique values on each call', () => {
			const verifier1 = generateCodeVerifier();
			const verifier2 = generateCodeVerifier();
			expect(verifier1).not.toBe(verifier2);
		});
	});

	describe('generateCodeChallenge', () => {
		it('should generate a valid code challenge from a verifier', async () => {
			const verifier = generateCodeVerifier();
			const challenge = await generateCodeChallenge(verifier);

			expect(challenge).toBeDefined();
			expect(typeof challenge).toBe('string');
			expect(challenge.length).toBeGreaterThan(0);
		});

		it('should only contain URL-safe characters', async () => {
			const verifier = generateCodeVerifier();
			const challenge = await generateCodeChallenge(verifier);

			// URL-safe base64: A-Z, a-z, 0-9, -, _
			const urlSafeRegex = /^[A-Za-z0-9\-_]+$/;
			expect(challenge).toMatch(urlSafeRegex);
		});

		it('should generate the same challenge for the same verifier', async () => {
			const verifier = 'test-verifier-123';
			const challenge1 = await generateCodeChallenge(verifier);
			const challenge2 = await generateCodeChallenge(verifier);

			expect(challenge1).toBe(challenge2);
		});

		it('should generate different challenges for different verifiers', async () => {
			const verifier1 = generateCodeVerifier();
			const verifier2 = generateCodeVerifier();
			const challenge1 = await generateCodeChallenge(verifier1);
			const challenge2 = await generateCodeChallenge(verifier2);

			expect(challenge1).not.toBe(challenge2);
		});
	});

	describe('getAuthorizationUrl', () => {
		const mockEnv = {
			SPOTIFY_CLIENT_ID: 'test-client-id',
			SPOTIFY_REDIRECT_URI: 'http://localhost:5173/auth/callback'
		};

		beforeEach(() => {
			vi.clearAllMocks();
		});

		it('should generate a valid authorization URL', async () => {
			const challenge = await generateCodeChallenge(generateCodeVerifier());
			const url = getAuthorizationUrl(
				mockEnv.SPOTIFY_CLIENT_ID,
				mockEnv.SPOTIFY_REDIRECT_URI,
				challenge
			);

			expect(url).toBeDefined();
			expect(url).toContain('https://accounts.spotify.com/authorize');
			expect(url).toContain('client_id=test-client-id');
			expect(url).toContain('response_type=code');
			expect(url).toContain('redirect_uri=');
			expect(url).toContain('code_challenge_method=S256');
			expect(url).toContain(`code_challenge=${challenge}`);
		});

		it('should include default scopes when none provided', async () => {
			const challenge = await generateCodeChallenge(generateCodeVerifier());
			const url = getAuthorizationUrl(
				mockEnv.SPOTIFY_CLIENT_ID,
				mockEnv.SPOTIFY_REDIRECT_URI,
				challenge
			);

			expect(url).toContain('scope=');
			expect(url).toContain('user-read-email');
			expect(url).toContain('user-read-private');
			expect(url).toContain('playlist-modify-public');
			expect(url).toContain('playlist-modify-private');
		});

		it('should include custom scopes when provided', async () => {
			const challenge = await generateCodeChallenge(generateCodeVerifier());
			const customScopes = ['user-read-email', 'playlist-read-private'];
			const url = getAuthorizationUrl(
				mockEnv.SPOTIFY_CLIENT_ID,
				mockEnv.SPOTIFY_REDIRECT_URI,
				challenge,
				customScopes
			);

			expect(url).toContain('scope=');
			expect(url).toContain('user-read-email');
			expect(url).toContain('playlist-read-private');
			expect(url).not.toContain('user-top-read');
		});

		it('should properly URL-encode the redirect URI', async () => {
			const challenge = await generateCodeChallenge(generateCodeVerifier());
			const redirectUri = 'http://localhost:5173/auth/callback?state=test';
			const url = getAuthorizationUrl(mockEnv.SPOTIFY_CLIENT_ID, redirectUri, challenge);

			expect(url).toContain('redirect_uri=');
			// URL should encode the query parameter
			expect(url).toContain(encodeURIComponent(redirectUri));
		});

		it('should generate unique URLs with different challenges', async () => {
			const verifier1 = generateCodeVerifier();
			const verifier2 = generateCodeVerifier();
			const challenge1 = await generateCodeChallenge(verifier1);
			const challenge2 = await generateCodeChallenge(verifier2);

			const url1 = getAuthorizationUrl(
				mockEnv.SPOTIFY_CLIENT_ID,
				mockEnv.SPOTIFY_REDIRECT_URI,
				challenge1
			);
			const url2 = getAuthorizationUrl(
				mockEnv.SPOTIFY_CLIENT_ID,
				mockEnv.SPOTIFY_REDIRECT_URI,
				challenge2
			);

			expect(url1).not.toBe(url2);
		});
	});
});
