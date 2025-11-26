# Testing Guide for SonoLens

This document explains the testing infrastructure for the SonoLens project.

## Test Framework

- **Vitest**: Fast unit test framework for Vite projects
- **Testing Library**: For Svelte component testing
- **jsdom**: Browser-like environment for tests

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run check
```

## Test Structure

### Unit Tests

Located alongside the source files they test:

- `src/lib/spotify.test.ts` - PKCE utilities and OAuth helpers
- `src/lib/utils/image.test.ts` - Image validation and processing
- `src/lib/server/ai.test.ts` - AI analysis validation (server-side)

### Integration Tests

Future integration tests will be placed in the `tests/` directory.

## Test Coverage

### PKCE Utilities (`src/lib/spotify.test.ts`)

✅ **13 tests passing**

- `generateCodeVerifier()`: Generates secure random verifiers
  - Default length (128 characters)
  - Custom length support
  - URL-safe characters only (A-Z, a-z, 0-9, -, ., _, ~)
  - Unique values each call

- `generateCodeChallenge()`: SHA-256 hashing
  - Valid challenge generation
  - URL-safe base64 encoding
  - Deterministic (same input = same output)
  - Different inputs = different outputs

- `getAuthorizationUrl()`: Spotify auth URL builder
  - Valid URL structure
  - Default scopes inclusion
  - Custom scopes support
  - Proper URL encoding
  - Unique URLs with different challenges

### Image Utilities (`src/lib/utils/image.test.ts`)

✅ **22 tests passing**

- `isValidImageType()`: File type validation
  - Accepts: JPG, PNG, WebP
  - Rejects: GIF, BMP, SVG, PDF, etc.

- `isValidImageSize()`: File size validation
  - Default 10MB limit
  - Custom size limits
  - Edge case (exactly at limit)

- `formatFileSize()`: Human-readable file sizes
  - Bytes (< 1KB)
  - Kilobytes (1KB - 1MB)
  - Megabytes (1MB - 1GB)
  - Gigabytes (1GB+)
  - Edge cases (0 bytes, negative values)

- `getFileExtension()`: Extension extraction
  - Standard files
  - Multiple dots in filename
  - Files without extension
  - Dot-files (.gitignore)
  - Case insensitive (converts to lowercase)

- `validateImageForUpload()`: Combined validation
  - Null return for valid images
  - Error messages for invalid type
  - Error messages for oversized files
  - Validates type before size

### AI Analysis Validation (`src/lib/server/ai.test.ts`)

✅ **Server-side tests** (excluded from jsdom environment)

- `validateMoodAnalysis()`: MoodAnalysis type guard
  - Complete valid analysis
  - Required field validation
  - Energy level validation (low/medium/high)
  - Array type validation
  - String type validation
  - Null/undefined rejection
  - Empty array/string handling

## Test Configuration

### `vitest.config.ts`

```typescript
{
  include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.svelte-kit/**',
    'src/lib/server/**/*.test.ts',  // Server-side tests
    'tests/example.test.ts'          // Svelte component tests
  ],
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./vitest-setup.ts']
}
```

### `vitest-setup.ts`

Imports Testing Library matchers:

```typescript
import '@testing-library/jest-dom';
```

## Writing Tests

### Example: Unit Test

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-module';

describe('My Module', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Example: Async Test

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Example: Mock Environment Variables

```typescript
const mockEnv = {
  SPOTIFY_CLIENT_ID: 'test-client-id',
  SPOTIFY_REDIRECT_URI: 'http://localhost:5173/auth/callback'
};
```

## Future Test Plans

### Phase 1 - Remaining Unit Tests ✅ COMPLETED
- [x] PKCE utilities
- [x] Image validation
- [x] AI validation

### Phase 2 - API Mocks (TODO)
- [ ] Mock Spotify API responses
- [ ] Mock OpenAI API responses
- [ ] Test error handling

### Phase 3 - Integration Tests (TODO)
- [ ] `/api/analyze-image` endpoint
- [ ] `/api/spotify/recommend` endpoint
- [ ] `/api/spotify/create-playlist` endpoint
- [ ] Auth callback flow

### Phase 4 - E2E Tests (TODO)
- [ ] Install Playwright
- [ ] Full user flow (login → upload → analyze → generate → save)
- [ ] Mobile camera capture
- [ ] Error states

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests clearly (setup → execute → verify)
3. **Edge Cases**: Always test boundary conditions
4. **Fast Tests**: Keep unit tests fast (< 10ms each)
5. **Isolation**: Each test should be independent
6. **Coverage**: Aim for high coverage of critical paths

## Debugging Tests

```bash
# Run specific test file
npx vitest run src/lib/spotify.test.ts

# Run tests matching a pattern
npx vitest run -t "PKCE"

# Watch mode for development
npx vitest watch
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` branch
- Pull requests

See `.github/workflows/ci.yml` for CI configuration.

## Known Issues

### Server-Side Tests
- Tests importing server-only modules (`$env/static/private`, OpenAI SDK) are excluded from jsdom environment
- Future: Create separate test config for server-side tests

### Svelte Component Tests
- Svelte 5 component testing requires updated Testing Library setup
- Currently excluded from test runs
- Future: Update to Svelte 5 testing patterns

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/intro/)
