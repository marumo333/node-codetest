import { describe, it, expect } from 'vitest';
import { solve } from '../src/index.js';

describe('solve', () => {
  it('finds the longest path for the sample input', () => {
    const input = [
      "1, 2, 8.54",
      "2, 3, 3.11",
      "3, 1, 2.19",
      "3, 4, 4",
      "4, 1, 1.4"
    ];
    expect(solve(input)).toBe("1\r\n2\r\n3\r\n4");
  });
});

