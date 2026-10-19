import { BlurFilter, Container, Graphics, Sprite } from 'pixi.js';
import { GAME_CONFIG } from '../config';
import type { SymbolId } from '../model';
import type { SymbolTextures } from '../loadSymbolTextures';
import { renderReel } from './renderReel';
import type { ReelState } from './types';

type CreateReelOptions = {
  textures: SymbolTextures;
  initialWindow: readonly SymbolId[];
  speedPxPerSecond: number;
  distancePx: number;
};

export type Reel = ReelState & {
  container: Container;
  destroy: () => void;
};

export function createReel({
  textures,
  initialWindow,
  speedPxPerSecond,
  distancePx,
}: CreateReelOptions): Reel {
  const { cellSize, rows } = GAME_CONFIG;

  if (initialWindow.length !== rows + 2) {
    throw new Error('The reel window must contain five symbols');
  }

  const container = new Container();
  const strip = new Container();

  const blur = new BlurFilter({
    strengthX: 0,
    strengthY: 0,
    quality: 2,
  });

  blur.enabled = false;
  strip.filters = [blur];

  let destroyed = false;

  const setMotionBlur = (speedPxPerSecond: number): void => {
    if (destroyed) {
      return;
    }

    const ratio = Math.min(
      Math.max(speedPxPerSecond, 0) / GAME_CONFIG.reelBlurReferenceSpeed,
      1,
    );

    blur.strengthY = GAME_CONFIG.maxReelBlurStrength * ratio;
    blur.enabled = speedPxPerSecond > 1;
  };

  const destroy = (): void => {
    if (destroyed) {
      return;
    }

    destroyed = true;

    strip.filters = null;
    blur.destroy();

    container.removeFromParent();
    container.destroy({ children: true });
  };

  const mask = new Graphics()
    .rect(0, 0, cellSize, rows * cellSize)
    .fill(0xffffff);

  container.addChild(strip, mask);
  // Clip the filtered strip to the reel viewport.
  container.mask = mask;

  const symbols = initialWindow.map(() => {
    // renderReel assigns and sizes the first texture.
    const symbol = new Sprite();

    symbol.anchor.set(0.5);
    symbol.x = cellSize / 2;

    strip.addChild(symbol);

    return symbol;
  });

  const reel: Reel = {
    container,
    symbols,
    // Convert the initial top-to-bottom window to strip order.
    stripIds: [...initialWindow].reverse(),
    offset: 0,
    speedPxPerSecond,
    durationMs: 0,
    distancePx,
    startOffsetPx: 0,
    setMotionBlur,
    destroy,
  };

  // Apply the initial positions and texture sizes.
  renderReel(reel, textures);

  return reel;
}
