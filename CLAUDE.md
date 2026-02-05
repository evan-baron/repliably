# Claude Code Project Guide

## Project Overview
Next.js 16 application for email automation with Auth0 authentication, Prisma ORM, and OpenAI integration.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: PostgreSQL via Prisma
- **Auth**: Auth0
- **AI**: OpenAI API
- **State**: TanStack React Query
- **Testing**: Vitest + Testing Library
- **Styling**: SCSS Modules

## Key Commands
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # ESLint check
npm test         # Run Vitest tests
```

## Project Structure
```
src/
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   ├── context/       # React contexts (AppContext, EmailContext)
│   └── dashboard/     # Dashboard pages
├── hooks/             # Custom React hooks (useContact, etc.)
├── lib/               # Shared utilities (auth0, prisma)
├── services/          # Business logic services
├── types/             # TypeScript type definitions
└── __tests__/         # Test fixtures and setup
```

## Testing Patterns

### Environment Configuration
- Default environment is `node`
- Component tests (`.test.tsx`) need jsdom - add directive at top of file:
  ```typescript
  /**
   * @vitest-environment jsdom
   */
  ```
- Hook tests in `src/hooks/` also need jsdom directive

### Mocking Next.js `redirect()`
Next.js `redirect()` throws an error to halt execution. Mock must also throw:
```typescript
class RedirectError extends Error {
  digest: string;
  constructor(url: string) {
    super(`NEXT_REDIRECT:${url}`);
    this.digest = `NEXT_REDIRECT;replace;${url};307`;
  }
}

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new RedirectError(url);
  }),
  // ...
}));
```

Test redirect behavior with:
```typescript
await expect(someFunction()).rejects.toThrow('NEXT_REDIRECT:/');
```

### JSON Response Date Comparisons
API responses serialize Date objects to strings. Compare with:
```typescript
expect(data.message).toEqual(JSON.parse(JSON.stringify(expectedObject)));
```

### TanStack Query Mutation Testing
`useMutation` passes extra context as second argument to mutation function:
```typescript
// Don't use: toHaveBeenCalledWith(data)
// Instead check first argument directly:
expect(mockAPI.create).toHaveBeenCalled();
expect(mockAPI.create.mock.calls[0][0]).toEqual(expectedData);
```

### Prisma Transaction Mocking
For `$transaction([...])` tests, mock the individual methods to return values:
```typescript
const mockPromise = { then: vi.fn() };
mockPrisma.prisma.message.create.mockReturnValue(mockPromise as never);
mockPrisma.prisma.$transaction.mockResolvedValue([result1, result2]);
```

## Build-Time Considerations

### Lazy Initialization for External Services
Don't instantiate API clients at module level - they run during build:
```typescript
// BAD - fails build without API key
const client = new OpenAI();

// GOOD - lazy initialization
let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI();
  }
  return client;
}
```

## Common Issues

### ESLint Warnings (Expected)
These warnings exist in the codebase and are acceptable:
- `react-hooks/incompatible-library` - React Hook Form's `watch()`
- `react-hooks/set-state-in-effect` - setState in useEffect for hydration

### File Paths with Brackets
When using git/shell commands with paths like `[id]`, quote the path:
```bash
git add "src/app/api/messages/[id]/approve/route.ts"
```

## CI/CD
GitHub Actions workflow at `.github/workflows/ci.yml` runs:
1. **build** - TypeScript check + Next.js build
2. **test** - Vitest (135 tests)
3. **lint** - ESLint

All jobs must pass for PR merge.
