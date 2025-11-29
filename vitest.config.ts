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
                'src/**/*.entity.ts',
                'src/types/**/*.ts',
                'src/app.ts',
                'src/bot.ts',
                'src/client.ts',
                'src/database/data-source.ts',
            ],
        },

        // Alias resolution (matches tsconfig paths)
        alias: {
            '@/': new URL('./src/', import.meta.url).pathname,
            '@root/': new URL('./', import.meta.url).pathname,
        },
    },
});
