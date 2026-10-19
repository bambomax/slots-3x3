import { GAME_CONFIG } from '../config';
import type { SymbolId } from '../model';
import type { SymbolTextures } from '../loadSymbolTextures';
import { getLoopWindow } from './getLoopWindow';
import { renderReel } from './renderReel';
import type { ReelState } from './types';
import { VISUAL_STRIP } from './visualStrip';

type LoopEntry = {
  reel: ReelState;
  strip: readonly SymbolId[];
  positionPx: number;
};

type RecoveryEntry = {
  entry: LoopEntry;
  startPositionPx: number;
  targetPositionPx: number;
  durationMs: number;
};

export function createLoopMotion(
  reels: readonly ReelState[],
  textures: SymbolTextures,
) {
  const { cellSize, rows } = GAME_CONFIG;

  let entries: LoopEntry[] = [];
  let recoveryEntries: RecoveryEntry[] = [];
  let recoveryElapsedMs = 0;

  const renderPosition = (
    entry: LoopEntry,
    positionPx: number,
  ): void => {
    const loopLengthPx = entry.strip.length * cellSize;

    entry.positionPx = positionPx % loopLengthPx;

    const firstIndex = Math.floor(entry.positionPx / cellSize);

    entry.reel.stripIds = getLoopWindow(entry.strip, firstIndex);

    entry.reel.offset = entry.positionPx - firstIndex * cellSize;

    renderReel(entry.reel, textures);
  };

  const start = (): void => {
    entries = reels.map((reel) => {
      const firstIndex = Math.floor(reel.offset / cellSize);

      const currentWindow = reel.stripIds.slice(
        firstIndex,
        firstIndex + rows + 2,
      );

      // Preserve the current picture before entering the visual loop.
      const strip = [...currentWindow, ...VISUAL_STRIP];
      const positionPx = reel.offset - firstIndex * cellSize;

      reel.stripIds = currentWindow;
      reel.offset = positionPx;
      reel.setMotionBlur(reel.speedPxPerSecond);

      renderReel(reel, textures);

      return { reel, strip, positionPx };
    });
  };

  const update = (deltaMs: number): void => {
    entries.forEach((entry) => {
      const nextPositionPx =
        entry.positionPx +
        entry.reel.speedPxPerSecond * deltaMs / 1000;

      renderPosition(entry, nextPositionPx);
    });
  };

  const beginRecovery = (): void => {
    recoveryElapsedMs = 0;

    recoveryEntries = entries.map((entry) => {
      const startPositionPx = entry.positionPx;

      // Stop at the next boundary without moving backwards.
      const targetPositionPx =
        Math.ceil(startPositionPx / cellSize) * cellSize;

      const remainingDistance = targetPositionPx - startPositionPx;

      return {
        entry,
        startPositionPx,
        targetPositionPx,
        durationMs:
          3 * remainingDistance / entry.reel.speedPxPerSecond * 1000,
      };
    });
  };

  const stop = (): void => {
    entries = [];
    recoveryEntries = [];
    recoveryElapsedMs = 0;
  };

  const updateRecovery = (deltaMs: number): boolean => {
    recoveryElapsedMs += deltaMs;

    recoveryEntries.forEach((recovery) => {
      const {
        entry,
        startPositionPx,
        targetPositionPx,
        durationMs,
      } = recovery;

      const progress = durationMs === 0
        ? 1
        : Math.min(recoveryElapsedMs / durationMs, 1);

      const easedProgress = 1 - (1 - progress) ** 3;

      // Cubic ease-out reduces speed by the square of remaining progress.
      const currentSpeed = entry.reel.speedPxPerSecond * (1 - progress) ** 2;

      entry.reel.setMotionBlur(currentSpeed);

      // Use the exact boundary on the final frame.
      const positionPx = progress === 1
        ? targetPositionPx
        : startPositionPx +
        (targetPositionPx - startPositionPx) * easedProgress;

      renderPosition(entry, positionPx);
    });

    const finished = recoveryEntries.every(
      (recovery) => recoveryElapsedMs >= recovery.durationMs,
    );

    if (finished) {
      stop();
    }

    return finished;
  };

  return {
    start,
    update,
    stop,
    beginRecovery,
    updateRecovery,
  };
}