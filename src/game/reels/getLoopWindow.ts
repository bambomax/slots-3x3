import { GAME_CONFIG } from '../config';
import type { SymbolId } from '../model';

export function getLoopWindow(
  strip: readonly SymbolId[],
  startIndex: number,
): SymbolId[] {
  if (strip.length === 0) {
    throw new Error('The visual strip must not be empty');
  }

  if (!Number.isSafeInteger(startIndex) || startIndex < 0) {
    throw new Error('startIndex must be a non-negative safe integer');
  }

  const windowSize = GAME_CONFIG.rows + 2;

  return Array.from({ length: windowSize }, (_, index) => {
    const stripIndex = (startIndex + index) % strip.length;

    return strip[stripIndex]!;
  });
}
