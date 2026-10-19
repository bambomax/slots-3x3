import { describe, expect, it, vi } from 'vitest';
import type { SymbolTextures } from '../loadSymbolTextures';
import { createLoopMotion } from './createLoopMotion';
import type { ReelState } from './types';
import { VISUAL_STRIP } from './visualStrip';

// Test motion state without creating a renderer.
vi.mock('./renderReel', () => ({
  renderReel: vi.fn(),
}));

describe('createLoopMotion', () => {
  it('recovers to the next cell boundary and preserves the window', () => {
    const reel: ReelState = {
      symbols: [],
      stripIds: ['bell', 'diamond', 'seven', 'bell', 'diamond'],
      offset: 50,
      startOffsetPx: 0,
      speedPxPerSecond: 2400,
      durationMs: 0,
      distancePx: 1540,
      setMotionBlur: vi.fn(),
    };

    const initialWindow = [...reel.stripIds];

    // Textures are unused because rendering is mocked.
    const textures = {} as SymbolTextures;
    const motion = createLoopMotion([reel], textures);

    motion.start();
    expect(reel.setMotionBlur).toHaveBeenLastCalledWith(2400);
    motion.beginRecovery();

    expect(motion.updateRecovery(10)).toBe(false);
    expect(reel.offset).toBeGreaterThan(50);
    expect(reel.offset).toBeLessThan(140);

    expect(motion.updateRecovery(1000)).toBe(true);
    expect(reel.setMotionBlur).toHaveBeenLastCalledWith(0);
    expect(reel.offset).toBe(0);

    expect(reel.stripIds).toEqual([
      ...initialWindow.slice(1),
      VISUAL_STRIP[0],
    ]);

    const stoppedWindow = [...reel.stripIds];

    motion.start();

    expect(reel.offset).toBe(0);
    expect(reel.stripIds).toEqual(stoppedWindow);
  });
});