import { describe, expect, it } from 'vitest';
import { greet } from './index.js';

describe('greet', () => {
  it('returns a hello message with the provided name', () => {
    expect(greet('Vue')).toBe('Hello Vue');
  });
});
