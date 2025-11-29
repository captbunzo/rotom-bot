import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Test file patterns
        include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],

        // Environment
        environment: 'node',

        // TypeScript support
        globals: true,
        typecheck: {
            tsconfig: './tsconfig.test.json',
        },

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts'],
            exclude: [
                // Entity files - TypeORM data models with minimal business logic
                'src/**/*.entity.ts',
                // Type definitions - No runtime code to test
                'src/types/**/*.ts',
                // Entry points - Bootstrap code with external dependencies
                'src/app.ts',
                'src/bot.ts',
                'src/client.ts',
                // Database configuration - Runtime configuration, not testable in isolation
                'src/database/data-source.ts',
            ],
        },

        // Alias resolution (matches tsconfig paths)
        // Using fileURLToPath for cross-platform compatibility (Windows/Unix)
        alias: {
            '@/': fileURLToPath(new URL('./src/', import.meta.url)),
            '@root/': fileURLToPath(new URL('./', import.meta.url)),
        },
    },
});
