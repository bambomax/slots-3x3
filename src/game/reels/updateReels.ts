import type { SymbolTextures } from '../loadSymbolTextures';
import { renderReel } from './renderReel';
import { easeOutCubic, getBrakingSpeed } from './reelMotionMath';
import type { ReelState } from './types';

export function updateReels(
  reels: readonly ReelState[],
  textures: SymbolTextures,
  elapsedMs: number,
): boolean {
  reels.forEach((reel) => {
    const progress = Math.min(elapsedMs / reel.durationMs, 1);

    const easedProgress = easeOutCubic(progress);

    const remainingDistance = reel.distancePx - reel.startOffsetPx;

    reel.offset =
      reel.startOffsetPx +
      remainingDistance * easedProgress;

    const currentSpeed = getBrakingSpeed(reel.speedPxPerSecond, progress);

    reel.setMotionBlur(currentSpeed);

    renderReel(reel, textures);
  });

  return reels.every(
    (reel) => elapsedMs >= reel.durationMs,
  );
}
