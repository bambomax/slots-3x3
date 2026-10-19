import type { Column, SymbolId } from './model';

export function buildReelStrip(
  currentWindow: readonly SymbolId[],
  target: Column,
  steps: number,
): SymbolId[] {
  if (currentWindow.length !== 5) {
    throw new Error('The reel window must contain five symbols');
  }

  if (!Number.isInteger(steps) || steps < 5) {
    throw new Error('steps must be an integer greater than or equal to five');
  }

  const requiredLength = steps + 5;
  const strip: SymbolId[] = [];

  while (strip.length < requiredLength) {
    strip.push(...currentWindow);
  }

  const plannedStrip = strip.slice(0, requiredLength);

  // Store the target bottom-to-top; target itself stays top-to-bottom.
  plannedStrip[steps + 1] = target[2];
  plannedStrip[steps + 2] = target[1];
  plannedStrip[steps + 3] = target[0];

  return plannedStrip;
}
