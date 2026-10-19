import type { SymbolTextures } from '../loadSymbolTextures';
import { renderReel } from './renderReel';
import type { ReelState } from './types';

export function updateReels(
  reels: readonly ReelState[],
  textures: SymbolTextures,
  elapsedMs: number,
): boolean {
  reels.forEach((reel) => {
    const progress = Math.min(elapsedMs / reel.durationMs, 1);

    // Slow down as the reel approaches its final position.
    const easedProgress = 1 - (1 - progress) ** 3;

    const remainingDistance = reel.distancePx - reel.startOffsetPx;

    reel.offset =
      reel.startOffsetPx +
      remainingDistance * easedProgress;

    const currentSpeed =
      reel.speedPxPerSecond * (1 - progress) ** 2;

    reel.setMotionBlur(currentSpeed);

    renderReel(reel, textures);
  });

  return reels.every(
    (reel) => elapsedMs >= reel.durationMs,
  );
}
