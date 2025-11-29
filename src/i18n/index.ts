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
 * Load translation resources from locale files
 */
function loadResources(): Record<string, { translation: Record<string, unknown> }> {
    const resources: Record<string, { translation: Record<string, unknown> }> = {};
    const localesPath = path.join(__dirname, '..', 'locales');

    for (const lang of Object.values(SupportedLanguages)) {
        const translationPath = path.join(localesPath, lang, 'translation.json');
        if (fs.existsSync(translationPath)) {
            try {
                const content = fs.readFileSync(translationPath, 'utf8');
                resources[lang] = { translation: JSON.parse(content) as Record<string, unknown> };
            } catch (error) {
                console.error(`Failed to parse translation file for language '${lang}':`, error);
            }
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
