import { describe, expect, it, vi } from 'vitest';
import type { Matrix } from '../model';
import type { SymbolTextures } from '../loadSymbolTextures';
import { prepareReelsStop } from './prepareReelsStop';
import { updateReels } from './updateReels';
import type { ReelState } from './types';

vi.mock('./renderReel', () => ({
  renderReel: vi.fn(),
}));

describe('prepareReelsStop', () => {
  it('preserves the current window and offset, then stops on the target', () => {
    const result: Matrix = [
      ['bell', 'diamond', 'seven'],
      ['cherry', 'lemon', 'plum'],
      ['seven', 'bell', 'cherry'],
    ];
    const reels: ReelState[] = result.map((_, column) => ({
      symbols: [],
      stripIds: ['bell', 'diamond', 'seven', 'cherry', 'lemon', 'plum', 'coin'],
      offset: 330,
      startOffsetPx: 0,
      speedPxPerSecond: 2400 + column * 150,
      durationMs: 0,
      distancePx: 140 * (11 + column * 2),
      setMotionBlur: vi.fn(),
    }));
    const windows = reels.map((reel) => reel.stripIds.slice(2, 7));

    prepareReelsStop(reels, result);

    reels.forEach((reel, column) => {
      expect(reel.stripIds.slice(0, 5)).toEqual(windows[column]);
      expect(reel.offset).toBe(50);
      expect(reel.startOffsetPx).toBe(50);
      expect(reel.durationMs).toBeGreaterThan(0);
    });

    const textures = {} as SymbolTextures;
    expect(updateReels(reels, textures, 0)).toBe(false);
    expect(reels.every((reel) => reel.offset === 50)).toBe(true);
    expect(updateReels(reels, textures, 10_000)).toBe(true);

    reels.forEach((reel, column) => {
      const firstIndex = reel.offset / 140;
      const visible = reel.stripIds.slice(firstIndex + 1, firstIndex + 4).reverse();

      expect(reel.offset).toBe(reel.distancePx);
      expect(visible).toEqual(result[column]);
      expect(reel.setMotionBlur).toHaveBeenLastCalledWith(0);
    });
  });
});
