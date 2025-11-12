import { describe, it, expect } from 'vitest';
import { union, intersection } from './index';

describe('array utils', () => {
  it('union', () => {
    expect(union([1, 2], [2, 3])).toEqual([1, 2, 3]);
    expect(union(['a'], ['a', 'b'])).toEqual(['a', 'b']);
  });

  it('intersection', () => {
    expect(intersection([1, 2], [2, 3])).toEqual([2]);
    expect(intersection(['a', 'b'], ['b', 'c'])).toEqual(['b']);
  });
});

