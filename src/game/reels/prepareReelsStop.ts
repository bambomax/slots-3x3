import { GAME_CONFIG } from '../config';
import { buildReelStrip } from '../buildReelStrip';
import type { Matrix } from '../model';
import { getBrakingDurationMs } from './reelMotionMath';
import type { ReelState } from './types';

export function prepareReelsStop(
  reels: readonly ReelState[],
  result: Matrix,
): void {
  const { cellSize, rows } = GAME_CONFIG;

  reels.forEach((reel, column) => {
    const currentStart = Math.floor(reel.offset / cellSize);
    const currentWindow = reel.stripIds.slice(
      currentStart,
      currentStart + rows + 2,
    );
    const steps = reel.distancePx / cellSize;
    const startOffsetPx = reel.offset - currentStart * cellSize;
    const remainingDistance = reel.distancePx - startOffsetPx;

    const plannedStrip = buildReelStrip(currentWindow, result[column], steps);

    reel.stripIds = plannedStrip;
    reel.startOffsetPx = startOffsetPx;
    reel.offset = startOffsetPx;
    reel.durationMs = getBrakingDurationMs(
      remainingDistance,
      reel.speedPxPerSecond,
    );
  });
}
