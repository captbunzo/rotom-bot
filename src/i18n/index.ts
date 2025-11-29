import i18next from 'i18next';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Supported languages for the bot
 */
export const SupportedLanguages = {
    English: 'en',
    Spanish: 'es',
} as const;

export type SupportedLanguage = (typeof SupportedLanguages)[keyof typeof SupportedLanguages];

/**
 * Default language for the bot
 */
export const DefaultLanguage: SupportedLanguage = SupportedLanguages.English;

/**
 * Translation file names to load for each language.
 * - translation.json: Manually managed translations
 * - pokemon.json: Generated translations from Pokémon GO data
 */
const TranslationFiles = ['translation.json', 'pokemon.json'] as const;

/**
 * Deep merge two objects, with source values overwriting target values
 */
function deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>
): Record<string, unknown> {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        const sourceValue = source[key];
        const targetValue = result[key];
        if (
            sourceValue !== null &&
            typeof sourceValue === 'object' &&
            !Array.isArray(sourceValue) &&
            targetValue !== null &&
            typeof targetValue === 'object' &&
            !Array.isArray(targetValue)
        ) {
            result[key] = deepMerge(
                targetValue as Record<string, unknown>,
                sourceValue as Record<string, unknown>
            );
        } else {
            result[key] = sourceValue;
        }
    }
    return result;
}

/**
 * Load translation resources from locale files.
 * Loads multiple translation files per language and merges them.
 */
function loadResources(): Record<string, { translation: Record<string, unknown> }> {
    const resources: Record<string, { translation: Record<string, unknown> }> = {};
    const localesPath = path.join(__dirname, '..', 'locales');

    for (const lang of Object.values(SupportedLanguages)) {
        let mergedTranslations: Record<string, unknown> = {};

        for (const file of TranslationFiles) {
            const translationPath = path.join(localesPath, lang, file);
            if (fs.existsSync(translationPath)) {
                try {
                    const content = fs.readFileSync(translationPath, 'utf8');
                    const translations = JSON.parse(content) as Record<string, unknown>;
                    mergedTranslations = deepMerge(mergedTranslations, translations);
                } catch (error) {
                    console.error(
                        `Failed to parse translation file '${file}' for language '${lang}':`,
                        error
                    );
                }
            }
        }

        if (Object.keys(mergedTranslations).length > 0) {
            resources[lang] = { translation: mergedTranslations };
        }
    }

    return resources;
}

/**
 * Initialize i18next synchronously with the loaded resources.
 * This is called immediately when the module is loaded.
 * Using initImmediate: false ensures synchronous initialization.
 */
function initI18nSync(): void {
    const resources = loadResources();

    // With initImmediate: false, i18next.init() completes synchronously
    // The returned promise resolves immediately, so we can safely ignore it
    void i18next.init({
        lng: DefaultLanguage,
        fallbackLng: DefaultLanguage,
        resources,
        interpolation: {
            escapeValue: false, // Discord handles escaping
        },
        initImmediate: false, // Force synchronous initialization
    });
}

// Initialize i18next immediately when the module is loaded
initI18nSync();

/**
 * Get a translation for a given key
 * @param key The translation key (e.g., 'bot.ready', 'errors.commandExecution')
 * @param options Optional interpolation values and language override
 * @returns The translated string
 */
export function t(
    key: string,
    options?: Record<string, string | number> & { lng?: SupportedLanguage }
): string {
    return i18next.t(key, options);
}

/**
 * Change the current language
 * @param language The language code to switch to
 */
export async function changeLanguage(language: SupportedLanguage): Promise<void> {
    await i18next.changeLanguage(language);
}

/**
 * Get the current language
 * @returns The current language code
 */
export function getCurrentLanguage(): string {
    return i18next.language;
}

export { i18next };
