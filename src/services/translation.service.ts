import { translationRepository } from '@/database/repositories.js';
import {
    Translation,
    type TranslationUpdate,
    type TranslationDelete,
} from '@/database/entities/translation.entity.js';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';

/**
 * Service layer for translation-related business logic
 */
export const TranslationService = {
    // ===== GET METHODS =====

    /**
     * Get translation by ID
     * @param id The translation ID
     * @returns Translation entity or null if not found
     */
    async get(id: string): Promise<Translation | null> {
        return await translationRepository.findOneBy({ id });
    },

    /**
     * Get translation by key
     * @param key The translation key
     * @returns Translation entity or null if not found
     */
    async getByKey(key: number): Promise<Translation | null> {
        return await translationRepository.findOneBy({ key });
    },

    /**
     * Get all translations
     * @returns Array of all translation entities
     */
    async getAll(): Promise<Translation[]> {
        return await translationRepository.find();
    },

    // ===== CREATE, UPDATE, DELETE METHODS =====

    /**
     * Create a new translation entity
     * @param translation The full translation entity to create
     * @returns The created translation entity
     */
    async create(translation: Translation): Promise<Translation> {
        return await translationRepository.save(translation);
    },

    /**
     * Update an existing translation entity
     * @param translation Either a full entity or partial entity with updates
     * @returns The updated translation entity
     */
    async update(translation: Translation | TranslationUpdate): Promise<Translation | null> {
        if (translation instanceof Translation) {
            return await translationRepository.save(translation);
        }

        const translationEntity = await this.get(translation.id);

        if (!translationEntity) {
            throw new EntityNotFoundError('Translation', translation.id);
        }

        // Update only the fields that exist in the partial (excluding primary keys and timestamps)
        if (translation.name !== undefined) {
            translationEntity.name = translation.name;
        }
        if (translation.key !== undefined) {
            translationEntity.key = translation.key;
        }
        if (translation.variant !== undefined) {
            translationEntity.variant = translation.variant;
        }
        if (translation.variantId !== undefined) {
            translationEntity.variantId = translation.variantId;
        }
        if (translation.isPlural !== undefined) {
            translationEntity.isPlural = translation.isPlural;
        }
        if (translation.language !== undefined) {
            translationEntity.language = translation.language;
        }
        if (translation.value !== undefined) {
            translationEntity.value = translation.value;
        }
        if (translation.code !== undefined) {
            translationEntity.code = translation.code;
        }

        return await translationRepository.save(translationEntity);
    },

    /**
     * Delete a translation entity
     * @param translation Either a full entity or an object with primary keys
     */
    async delete(translation: Translation | TranslationDelete): Promise<void> {
        const translationEntity =
            translation instanceof Translation ? translation : await this.get(translation.id);

        if (!translationEntity) {
            throw new EntityNotFoundError('Translation', translation.id);
        }

        await translationRepository.remove(translationEntity);
    },
};
