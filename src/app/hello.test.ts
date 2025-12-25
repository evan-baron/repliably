import { describe, it, expect } from 'vitest';

describe('Hello Functionality', () => {
    it('should return "Hello, World!"', () => {
        const hello = () => 'Hello, World!';
        expect(hello()).toBe('Hello, World!');
    });
});