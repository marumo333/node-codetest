import { describe, it, expect } from 'vitest';
import { solve } from '../src/index.js';

describe('solve', () => {
  it('doubles first line', () => {
    expect(solve(['21'])).toBe('42');
  });
});
