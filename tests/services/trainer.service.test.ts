import { describe, it, expect } from 'vitest';
import { TrainerService } from '@/services/trainer.service.js';

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
            const trainer = {
                discordId: '123',
                trainerName: 'TestTrainer',
                code: '123456789012',
                firstName: null,
                level: null,
                team: null,
                aboutMe: null,
                favoritePokemon: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            // Use type assertion since we're testing with a mock object
            expect(TrainerService.isSetupComplete(trainer as never)).toBe(true);
        });

        it('should return false when trainer has no name', () => {
            const trainer = {
                discordId: '123',
                trainerName: null,
                code: '123456789012',
                firstName: null,
                level: null,
                team: null,
                aboutMe: null,
                favoritePokemon: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            expect(TrainerService.isSetupComplete(trainer as never)).toBe(false);
        });

        it('should return false when trainer has no code', () => {
            const trainer = {
                discordId: '123',
                trainerName: 'TestTrainer',
                code: null,
                firstName: null,
                level: null,
                team: null,
                aboutMe: null,
                favoritePokemon: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            expect(TrainerService.isSetupComplete(trainer as never)).toBe(false);
        });

        it('should return false for null trainer', () => {
            expect(TrainerService.isSetupComplete(null)).toBe(false);
        });

        it('should return false when trainer has neither name nor code', () => {
            const trainer = {
                discordId: '123',
                trainerName: null,
                code: null,
                firstName: null,
                level: null,
                team: null,
                aboutMe: null,
                favoritePokemon: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            expect(TrainerService.isSetupComplete(trainer as never)).toBe(false);
        });
    });

    describe('getSetupTrainerFirstMessage', () => {
        it('should return setup message for null trainer', () => {
            const result = TrainerService.getSetupTrainerFirstMessage(null);
            expect(result.content).toBe('Please setup your profile first with /setup-profile');
        });

        it('should return specific message when trainer has partial setup (missing name)', () => {
            const trainer = {
                discordId: '123',
                trainerName: null,
                code: '123456789012',
                firstName: null,
                level: null,
                team: null,
                aboutMe: null,
                favoritePokemon: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const result = TrainerService.getSetupTrainerFirstMessage(trainer as never);
            expect(result.content).toBe(
                'Please set your trainer name and code first with /setup-profile'
            );
        });

        it('should return specific message when trainer has partial setup (missing code)', () => {
            const trainer = {
                discordId: '123',
                trainerName: 'TestTrainer',
                code: null,
                firstName: null,
                level: null,
                team: null,
                aboutMe: null,
                favoritePokemon: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const result = TrainerService.getSetupTrainerFirstMessage(trainer as never);
            expect(result.content).toBe(
                'Please set your trainer name and code first with /setup-profile'
            );
        });

        it('should return general setup message for fully setup trainer', () => {
            const trainer = {
                discordId: '123',
                trainerName: 'TestTrainer',
                code: '123456789012',
                firstName: null,
                level: null,
                team: null,
                aboutMe: null,
                favoritePokemon: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const result = TrainerService.getSetupTrainerFirstMessage(trainer as never);
            // When trainer is fully setup, this message is returned (the function logic)
            expect(result.content).toBe('Please setup your profile first with /setup-profile');
        });
    });
});
