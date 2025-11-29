import { describe, it, expect } from 'vitest';
import { StringUtils } from '@/utils/string.utils.js';

describe('StringUtils', () => {
    describe('camelToSnakeCase', () => {
        it('should convert camelCase to snake_case', () => {
            expect(StringUtils.camelToSnakeCase('camelCase')).toBe('camel_case');
        });

        it('should convert PascalCase to snake_case', () => {
            expect(StringUtils.camelToSnakeCase('PascalCase')).toBe('_pascal_case');
        });

        it('should handle single lowercase word', () => {
            expect(StringUtils.camelToSnakeCase('test')).toBe('test');
        });

        it('should handle multiple capital letters', () => {
            expect(StringUtils.camelToSnakeCase('myTestString')).toBe('my_test_string');
        });

        it('should handle empty string', () => {
            expect(StringUtils.camelToSnakeCase('')).toBe('');
        });
    });

    describe('snakeToCamelCase', () => {
        it('should convert snake_case to camelCase', () => {
            expect(StringUtils.snakeToCamelCase('snake_case')).toBe('snakeCase');
        });

        it('should handle single word', () => {
            expect(StringUtils.snakeToCamelCase('test')).toBe('test');
        });

        it('should handle multiple underscores', () => {
            expect(StringUtils.snakeToCamelCase('my_test_string')).toBe('myTestString');
        });

        it('should handle empty string', () => {
            expect(StringUtils.snakeToCamelCase('')).toBe('');
        });
    });

    describe('capitalize', () => {
        it('should capitalize first letter', () => {
            expect(StringUtils.capitalize('hello')).toBe('Hello');
        });

        it('should handle already capitalized string', () => {
            expect(StringUtils.capitalize('Hello')).toBe('Hello');
        });

        it('should handle single character', () => {
            expect(StringUtils.capitalize('h')).toBe('H');
        });

        it('should handle empty string', () => {
            expect(StringUtils.capitalize('')).toBe('');
        });
    });

    describe('titleCase', () => {
        it('should convert to title case', () => {
            expect(StringUtils.titleCase('hello world')).toBe('Hello World');
        });

        it('should handle mixed case input', () => {
            expect(StringUtils.titleCase('hELLO wORLD')).toBe('Hello World');
        });

        it('should handle single word', () => {
            expect(StringUtils.titleCase('test')).toBe('Test');
        });

        it('should handle empty string', () => {
            expect(StringUtils.titleCase('')).toBe('');
        });
    });

    describe('makeId', () => {
        it('should generate id of specified length', () => {
            const id = StringUtils.makeId(10);
            expect(id).toHaveLength(10);
        });

        it('should generate unique ids', () => {
            const id1 = StringUtils.makeId(10);
            const id2 = StringUtils.makeId(10);
            expect(id1).not.toBe(id2);
        });

        it('should only contain allowed characters', () => {
            const id = StringUtils.makeId(100);
            const allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ3456789';
            for (const char of id) {
                expect(allowedChars).toContain(char);
            }
        });

        it('should handle zero length', () => {
            expect(StringUtils.makeId(0)).toBe('');
        });
    });

    describe('makeInviteCode', () => {
        it('should generate a 6 character invite code', () => {
            const code = StringUtils.makeInviteCode();
            expect(code).toHaveLength(6);
        });

        it('should generate unique codes', () => {
            const code1 = StringUtils.makeInviteCode();
            const code2 = StringUtils.makeInviteCode();
            expect(code1).not.toBe(code2);
        });
    });

    describe('trimCleanseArgs', () => {
        it('should remove surrounding single quotes', () => {
            expect(StringUtils.trimCleanseArgs("'hello world'")).toBe('hello world');
        });

        it('should remove surrounding double quotes', () => {
            expect(StringUtils.trimCleanseArgs('"hello world"')).toBe('hello world');
        });

        it('should not modify unquoted strings', () => {
            expect(StringUtils.trimCleanseArgs('hello world')).toBe('hello world');
        });

        it('should handle empty string', () => {
            expect(StringUtils.trimCleanseArgs('')).toBe('');
        });
    });

    describe('joinTrimCleanseArgs', () => {
        it('should join and cleanse array of arguments', () => {
            expect(StringUtils.joinTrimCleanseArgs(["'hello", "world'"])).toBe('hello world');
        });

        it('should handle single element array', () => {
            expect(StringUtils.joinTrimCleanseArgs(['"test"'])).toBe('test');
        });

        it('should handle empty array', () => {
            expect(StringUtils.joinTrimCleanseArgs([])).toBe('');
        });
    });

    describe('getPrefix', () => {
        it('should return common prefix', () => {
            expect(StringUtils.getPrefix(['prefix_one', 'prefix_two', 'prefix_three'])).toBe(
                'prefix_'
            );
        });

        it('should return empty string when no common prefix', () => {
            expect(StringUtils.getPrefix(['abc', 'xyz', 'def'])).toBe('');
        });

        it('should return the word when array has single element', () => {
            expect(StringUtils.getPrefix(['single'])).toBe('single');
        });

        it('should return null for empty array', () => {
            expect(StringUtils.getPrefix([])).toBeNull();
        });

        it('should handle empty strings in array', () => {
            expect(StringUtils.getPrefix(['', 'test'])).toBe('');
        });
    });

    describe('constants', () => {
        it('should have correct INDENT value', () => {
            expect(StringUtils.INDENT).toBe('    ');
        });

        it('should have correct ZWSP value', () => {
            expect(StringUtils.ZWSP).toBe('\u200b');
        });
    });
});
