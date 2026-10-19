import { describe, expect, it } from 'vitest';
import { buildReelStrip } from './buildReelStrip';
import type { Column, SymbolId } from './model';

const currentWindow: readonly SymbolId[] = [
  'diamond',
  'bell',
  'seven',
  'diamond',
  'bell',
];

const target: Column = ['bell', 'diamond', 'seven'];

describe('buildReelStrip', () => {
  it('preserves the current window at the start', () => {
    const strip = buildReelStrip(currentWindow, target, 11);

    expect(strip.slice(0, 5)).toEqual(currentWindow);
  });

  it.each([5, 11, 13, 15])(
    'shows the target after moving %i cells',
    (steps) => {
      const strip = buildReelStrip(currentWindow, target, steps);

      const finalWindow = strip.slice(steps, steps + 5);
      const visibleTopToBottom = finalWindow.slice(1, 4).reverse();

      expect(finalWindow).toHaveLength(5);
      expect(visibleTopToBottom).toEqual(target);
    },
  );

  it('does not change the input arrays', () => {
    const windowBefore = [...currentWindow];
    const targetBefore = [...target];

    buildReelStrip(currentWindow, target, 11);

    expect(currentWindow).toEqual(windowBefore);
    expect(target).toEqual(targetBefore);
  });

  it('rejects an incomplete current window', () => {
    expect(() =>
      buildReelStrip(currentWindow.slice(0, 4), target, 11),
    ).toThrow();
  });

  it.each([4, 5.5, -1])(
    'rejects invalid steps: %s',
    (steps) => {
      expect(() =>
        buildReelStrip(currentWindow, target, steps),
      ).toThrow();
    },
  );
});