import { describe, expect, it } from 'vitest';
import type { SymbolId } from '../model';
import { getLoopWindow } from './getLoopWindow';

const strip: readonly SymbolId[] = [
  'bell',
  'diamond',
  'seven',
];

describe('getLoopWindow', () => {
  it('reads a window longer than the source strip', () => {
    expect(getLoopWindow(strip, 0)).toEqual([
      'bell',
      'diamond',
      'seven',
      'bell',
      'diamond',
    ]);
  });

  it.each([2, 8, 3002])(
    'wraps around the strip from index %i',
    (startIndex) => {
      expect(getLoopWindow(strip, startIndex)).toEqual([
        'seven',
        'bell',
        'diamond',
        'seven',
        'bell',
      ]);
    },
  );

  it('preserves overlapping symbols when advancing one cell', () => {
    const current = getLoopWindow(strip, 2);
    const next = getLoopWindow(strip, 3);

    expect(current.slice(1)).toEqual(next.slice(0, 4));
  });

  it('rejects an empty strip', () => {
    expect(() => getLoopWindow([], 0)).toThrow();
  });

  it.each([-1, 1.5])('rejects invalid index %s', (startIndex) => {
    expect(() => getLoopWindow(strip, startIndex)).toThrow();
  });
});