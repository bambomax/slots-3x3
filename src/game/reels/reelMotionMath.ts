export function getBrakingDurationMs(
  distancePx: number,
  speedPxPerSecond: number,
): number {
  // Cubic ease-out starts at three times its average speed.
  return 3 * distancePx / speedPxPerSecond * 1000;
}

export function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3;
}

export function getBrakingSpeed(
  initialSpeedPxPerSecond: number,
  progress: number,
): number {
  return initialSpeedPxPerSecond * (1 - progress) ** 2;
}
