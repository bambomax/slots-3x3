import { afterEach, describe, expect, it, vi } from 'vitest';
import { Sprite, Texture, TextureSource } from 'pixi.js';
import { SYMBOL_IDS } from '../model';
import type { SymbolTextures } from '../loadSymbolTextures';
import { renderReel } from './renderReel';
import type { ReelState } from './types';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('renderReel texture sizing', () => {
  it('fits initial textures and only rescales when a texture changes', () => {
    const normal = new Texture({
      source: new TextureSource({ width: 128, height: 64 }),
    });
    const wide = new Texture({
      source: new TextureSource({ width: 256, height: 128 }),
    });
    const textures = Object.fromEntries(
      SYMBOL_IDS.map((id) => [id, id === 'diamond' ? wide : normal]),
    ) as SymbolTextures;
    const reel: ReelState = {
      symbols: Array.from({ length: 5 }, () => new Sprite()),
      stripIds: ['bell', 'bell', 'bell', 'bell', 'bell'],
      offset: 0,
      startOffsetPx: 0,
      speedPxPerSecond: 2400,
      durationMs: 0,
      distancePx: 1540,
      setMotionBlur: vi.fn(),
    };

    try {
      renderReel(reel, textures);

      reel.symbols.forEach((symbol) => {
        expect(symbol.width).toBeCloseTo(112);
        expect(symbol.height).toBeCloseTo(56);
      });

      const symbol = reel.symbols[1]!;
      const scaleSet = vi.spyOn(symbol.scale, 'set');

      reel.offset = 50;
      renderReel(reel, textures);

      expect(scaleSet).not.toHaveBeenCalled();
      expect(symbol.y).toBe(120);

      reel.stripIds[3] = 'diamond';
      renderReel(reel, textures);

      expect(scaleSet).toHaveBeenCalledTimes(1);
      expect(symbol.texture).toBe(wide);
      expect(symbol.width).toBeCloseTo(112);
      expect(symbol.height).toBeCloseTo(56);

      renderReel(reel, textures);
      expect(scaleSet).toHaveBeenCalledTimes(1);
    } finally {
      reel.symbols.forEach((symbol) => symbol.destroy());
      normal.destroy(true);
      wide.destroy(true);
    }
  });
});
