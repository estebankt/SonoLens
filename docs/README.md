# SonoLens Documentation

This directory contains comprehensive documentation for the SonoLens project.

## 📚 Documentation Index

### Testing Documentation
- **[TestingGuide.md](./TestingGuide.md)** - Complete guide to the testing infrastructure, including Vitest unit tests and Playwright E2E tests
- **[TestingPlan.md](./TestingPlan.md)** - Playwright E2E testing implementation plan and strategy
- **[CoveragePlan.md](./CoveragePlan.md)** - Comprehensive Vitest unit test coverage plan across all modules

## 🏗️ Project Structure

```
SonoLens/
├── src/
│   ├── routes/          # SvelteKit file-based routing
│   │   ├── api/         # Backend API endpoints
│   │   ├── create/      # Main playlist creation flow
│   │   ├── dashboard/   # User dashboard
│   │   ├── demo/        # Demo mode entry point (sets cookie, redirects to /create)
│   │   └── auth/        # Spotify OAuth handlers
│   └── lib/
│       ├── components/  # Reusable Svelte components
│       ├── server/      # Server-only code (AI integration)
│       ├── utils/       # Client utilities (image, mood mapping)
│       ├── types/       # TypeScript type definitions
│       └── demo-data.ts # Mock data used by demo mode across all routes
└── tests/
    ├── unit/            # Vitest unit tests
    │   ├── api/         # API endpoint tests
    │   ├── lib/         # Library function tests
    │   └── helpers/     # Test utilities and fixtures
    └── e2e/             # Playwright E2E tests
        └── fixtures/    # E2E test helpers and mock data
```

## 🧪 Testing Quick Reference

### Run Unit Tests
```bash
npm test              # Run all unit tests
npm run test:watch    # Watch mode for development
```

### Run E2E Tests
```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Run with Playwright UI
npm run test:e2e:headed   # Run with browser visible
```

### Code Quality
```bash
npm run check    # Type checking
npm run lint     # ESLint + Prettier check
npm run format   # Auto-format code
```

## 🔗 Related Documentation

- **[Root README.md](../README.md)** - Main project documentation with setup instructions
- **[CLAUDE.md](../CLAUDE.md)** - Project context and guidelines for AI assistants

## 📊 Test Coverage Status

**Current Coverage:**
- ✅ **203 unit tests** passing across all modules
- ✅ **19 E2E tests** covering critical user flows
- ✅ **High coverage** on utilities, API endpoints, and Spotify client

**Coverage by Area:**
- Utilities (image, mood-to-spotify): 95%+
- Spotify client functions: 90%+
- API endpoints: 80%+
- Server-side AI logic: Fully tested
