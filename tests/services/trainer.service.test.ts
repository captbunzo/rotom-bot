import { describe, it, expect } from 'vitest';
import { TrainerService } from '@/services/trainer.service.js';
import type { Trainer } from '@/database/entities/trainer.entity.js';

/**
 * Creates a mock Trainer object for testing purposes.
 * This avoids the need for 'as never' type assertions and provides type safety.
 */
function createMockTrainer(overrides: Partial<Trainer> = {}): Trainer {
    return {
        discordId: '123456789',
        trainerName: null,
        firstName: null,
        code: null,
        level: null,
        team: null,
        aboutMe: null,
        favoritePokemon: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as Trainer;
}

describe('TrainerService', () => {
    describe('formatTrainerCode', () => {
        it('should format a 12-digit trainer code with spaces', () => {
            expect(TrainerService.formatTrainerCode('123456789012')).toBe('1234 5678 9012');
        });

        it('should handle code with existing spaces', () => {
            expect(TrainerService.formatTrainerCode('1234567890')).toBe('1234 5678 90');
        });

        it('should return null for null input', () => {
            expect(TrainerService.formatTrainerCode(null)).toBeNull();
        });

        it('should return null for empty string', () => {
            expect(TrainerService.formatTrainerCode('')).toBeNull();
        });

        it('should handle short codes', () => {
            expect(TrainerService.formatTrainerCode('1234')).toBe('1234');
        });

        it('should handle 8 digit codes', () => {
            expect(TrainerService.formatTrainerCode('12345678')).toBe('1234 5678');
        });
    });

    describe('isSetupComplete', () => {
        it('should return true when trainer has both name and code', () => {
            const trainer = createMockTrainer({
                trainerName: 'TestTrainer',
                code: '123456789012',
            });
            expect(TrainerService.isSetupComplete(trainer)).toBe(true);
        });

        it('should return false when trainer has no name', () => {
            const trainer = createMockTrainer({
                trainerName: null,
                code: '123456789012',
            });
            expect(TrainerService.isSetupComplete(trainer)).toBe(false);
        });

        it('should return false when trainer has no code', () => {
            const trainer = createMockTrainer({
                trainerName: 'TestTrainer',
                code: null,
            });
            expect(TrainerService.isSetupComplete(trainer)).toBe(false);
        });

        it('should return false for null trainer', () => {
            expect(TrainerService.isSetupComplete(null)).toBe(false);
        });

        it('should return false when trainer has neither name nor code', () => {
            const trainer = createMockTrainer({
                trainerName: null,
                code: null,
            });
            expect(TrainerService.isSetupComplete(trainer)).toBe(false);
        });
    });

    describe('getSetupTrainerFirstMessage', () => {
        it('should return setup message for null trainer', () => {
            const result = TrainerService.getSetupTrainerFirstMessage(null);
            expect(result.content).toBe('Please setup your profile first with /setup-profile');
        });

        it('should return specific message when trainer has partial setup (missing name)', () => {
            const trainer = createMockTrainer({
                trainerName: null,
                code: '123456789012',
            });
            const result = TrainerService.getSetupTrainerFirstMessage(trainer);
            expect(result.content).toBe(
                'Please set your trainer name and code first with /setup-profile'
            );
        });

        it('should return specific message when trainer has partial setup (missing code)', () => {
            const trainer = createMockTrainer({
                trainerName: 'TestTrainer',
                code: null,
            });
            const result = TrainerService.getSetupTrainerFirstMessage(trainer);
            expect(result.content).toBe(
                'Please set your trainer name and code first with /setup-profile'
            );
        });

        it('should return general setup message when trainer has both name and code', () => {
            // Note: This function is intended to be called when trainer setup is incomplete.
            // When called with a fully setup trainer, it returns the generic message.
            // Callers should use isSetupComplete() to check if setup is needed.
            const trainer = createMockTrainer({
                trainerName: 'TestTrainer',
                code: '123456789012',
            });
            const result = TrainerService.getSetupTrainerFirstMessage(trainer);
            expect(result.content).toBe('Please setup your profile first with /setup-profile');
        });
    });
});
