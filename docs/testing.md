# Testing Guide

This guide covers the testing framework, conventions, and best practices for Rotom Bot.

## Overview

Rotom Bot uses [Vitest](https://vitest.dev/) as its testing framework. Vitest is a modern, fast testing framework that provides native ESM support and TypeScript integration, making it ideal for this project.

## Quick Start

```bash
# Run all tests
pnpm run test

# Run tests in watch mode (development)
pnpm run test:watch

# Run tests with coverage report
pnpm run test:coverage
```

## Test Directory Structure

```
tests/
├── utils/                    # Unit tests for utility functions
│   ├── string.utils.test.ts  # StringUtils tests
│   └── translation.utils.test.ts  # TranslationUtils tests
├── services/                 # Unit tests for service layer
│   └── trainer.service.test.ts  # TrainerService tests
├── constants.test.ts         # Tests for constants
└── [future directories]
    ├── commands/            # Command tests (planned)
    ├── components/          # Component tests (planned)
    └── integration/         # Integration tests (planned)
```

## Writing Tests

### Test File Naming

- Unit tests: `*.test.ts` or `*.spec.ts`
- Place tests in the `tests/` directory following the same structure as `src/`

### Basic Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { MyFunction } from '@/path/to/module.js';

describe('MyFunction', () => {
    describe('specificMethod', () => {
        it('should do something specific', () => {
            const result = MyFunction.specificMethod('input');
            expect(result).toBe('expected output');
        });

        it('should handle edge cases', () => {
            expect(MyFunction.specificMethod('')).toBe('');
        });
    });
});
```

### Using Path Aliases

The test configuration supports the same path aliases as the main project:

```typescript
// Use @/ for src/ directory
import { StringUtils } from '@/utils/string.utils.js';

// Use @root/ for project root
import { something } from '@root/config.js';
```

### Testing Async Functions

```typescript
describe('asyncFunction', () => {
    it('should handle async operations', async () => {
        const result = await asyncFunction();
        expect(result).toBeDefined();
    });

    it('should handle errors', async () => {
        await expect(asyncFunction('invalid')).rejects.toThrow('Error message');
    });
});
```

### Mocking

For functions that require database or external services, use Vitest's mocking capabilities:

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the repository
vi.mock('@/database/repositories.js', () => ({
    trainerRepository: {
        findOneBy: vi.fn(),
        save: vi.fn(),
        remove: vi.fn(),
    },
}));

describe('ServiceWithMocks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should use mocked repository', async () => {
        const { trainerRepository } = await import('@/database/repositories.js');
        vi.mocked(trainerRepository.findOneBy).mockResolvedValue(null);

        // Test your function
    });
});
```

## Test Categories

### Unit Tests

Unit tests focus on individual functions and methods in isolation:

- **Utility Functions**: Test pure functions in `src/utils/`
- **Service Methods**: Test business logic methods that don't require database
- **Constants**: Verify constant values are correct

### Integration Tests (Planned)

Integration tests verify multiple components working together:

- **Database Operations**: Test repository methods with test database
- **Service Layer**: Test full service methods with mocked dependencies

### Regression Tests

Regression tests ensure bugs don't reoccur:

- Place in the same test file as related unit tests
- Document the issue being prevented in the test description

```typescript
describe('regression tests', () => {
    it('should handle null values correctly (issue #123)', () => {
        // This test ensures the bug from issue #123 doesn't reoccur
        expect(functionUnderTest(null)).not.toThrow();
    });
});
```

## Coverage

### Running Coverage

```bash
pnpm run test:coverage
```

### Coverage Reports

Coverage reports are generated in the following formats:
- **Text**: Console output during test run
- **JSON**: `coverage/coverage-final.json`
- **HTML**: `coverage/index.html` (view in browser)

### Coverage Exclusions

The following are excluded from coverage:
- Entity files (`*.entity.ts`)
- Type definitions (`src/types/**/*.ts`)
- Entry points (`app.ts`, `bot.ts`, `client.ts`)
- Database configuration (`data-source.ts`)

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ✅ Good: Tests behavior
it('should format trainer code with spaces every 4 digits', () => {
    expect(formatTrainerCode('123456789012')).toBe('1234 5678 9012');
});

// ❌ Bad: Tests implementation details
it('should use regex to add spaces', () => {
    // Don't test HOW it works, test WHAT it does
});
```

### 2. Use Descriptive Test Names

```typescript
// ✅ Good
it('should return null when trainer code is empty', () => {});
it('should capitalize the first letter of each word', () => {});

// ❌ Bad
it('works', () => {});
it('test 1', () => {});
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should update trainer team', async () => {
    // Arrange
    const discordId = '123456789';
    const team = 'Mystic';

    // Act
    const result = await TrainerService.updateTeam(discordId, team);

    // Assert
    expect(result.team).toBe(team);
});
```

### 4. Test Edge Cases

```typescript
describe('edge cases', () => {
    it('should handle empty string', () => {});
    it('should handle null input', () => {});
    it('should handle very long strings', () => {});
    it('should handle special characters', () => {});
});
```

### 5. Keep Tests Independent

- Each test should be able to run independently
- Don't rely on test execution order
- Clean up any state in `beforeEach` or `afterEach`

## Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
        environment: 'node',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
    },
});
```

### TypeScript Support

Tests use the same TypeScript configuration as the main project. Path aliases are configured in `vitest.config.ts` to match `tsconfig.json`.

## Troubleshooting

### Common Issues

#### "Cannot find module" errors

Ensure you're using the `.js` extension in imports:
```typescript
// ✅ Correct
import { StringUtils } from '@/utils/string.utils.js';

// ❌ Incorrect (for ESM)
import { StringUtils } from '@/utils/string.utils';
```

#### Tests not running

1. Ensure test files are in the `tests/` directory
2. Ensure file names end with `.test.ts` or `.spec.ts`
3. Run `pnpm install` to ensure dependencies are installed

#### Coverage not working

Ensure `@vitest/coverage-v8` is installed and the coverage configuration is correct in `vitest.config.ts`.

## Future Improvements

- [ ] Add integration tests for database operations
- [ ] Add end-to-end tests for Discord commands
- [ ] Set up CI/CD pipeline for automated testing
- [ ] Add mutation testing for test quality verification
- [ ] Create test fixtures for common test data

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/write-tests)
- [Discord.js Testing Guide](https://discord.js.org/docs/packages/discord.js/stable/general/welcome)
