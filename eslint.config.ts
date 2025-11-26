// @ts-check
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['.react-router/']),

    // Import recommended configs from plugins
    tseslint.configs.recommended,

    // Global settings
    {
        ignores: ['**/dist/**', 'coverage/**', '**/node_modules/**'],
        settings: {
            react: {
                version: 'detect',
            },
        },
    },

    // Configuration for ESLint config file itself (needs Node.js globals)
    {
        files: ['eslint.config.ts'],
        settings: {
            react: {
                version: 'detect',
            },
        },
        languageOptions: {
            globals: {
                ...globals.node,
            },
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },

    // Configuration for TypeScript and JavaScript project files
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        ignores: ['eslint.config.ts', '**/archive/**'],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.strictTypeChecked,
            importPlugin.flatConfigs.recommended,
            importPlugin.flatConfigs.typescript,
            eslintComments.recommended,
            eslintConfigPrettier,
            eslintPluginUnicorn.configs.recommended,
        ],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                projectService: {
                    defaultProject: 'tsconfig.json',
                    allowDefaultProject: [
                        'eslint.config.ts',
                        '.prettierrc.ts',
                        'tsdown.config.ts',
                        'react-router.config.ts',
                    ],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'unicorn/filename-case': [
                'error',
                {
                    case: 'kebabCase',
                    multipleFileExtensions: false,
                },
            ],
            'unicorn/prevent-abbreviations': [
                'error',
                {
                    allowList: {},
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: 'unicorn/^_' },
            ],
            '@typescript-eslint/no-misused-promises': [
                2,
                {
                    checksVoidReturn: {
                        attributes: false,
                    },
                },
            ],
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            'import/no-unresolved': 'off',
        },
    },
    {
        files: ['**/src/routes/**/*.{ts,tsx}'],
        rules: {
            'unicorn/filename-case': 'off',
        },
    },
]);
