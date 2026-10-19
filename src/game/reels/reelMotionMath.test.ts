import { describe, expect, it } from 'vitest';
import {
  easeOutCubic,
  getBrakingDurationMs,
  getBrakingSpeed,
} from './reelMotionMath';

describe('reel braking math', () => {
  it('starts at the requested speed and finishes at rest', () => {
    const distancePx = 1490;
    const speedPxPerSecond = 2400;
    const durationMs = getBrakingDurationMs(distancePx, speedPxPerSecond);
    const sampleMs = 0.001;
    const firstDistance = distancePx * easeOutCubic(sampleMs / durationMs);

    expect(firstDistance / (sampleMs / 1000)).toBeCloseTo(speedPxPerSecond, 1);
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(getBrakingSpeed(speedPxPerSecond, 0)).toBe(speedPxPerSecond);
    expect(getBrakingSpeed(speedPxPerSecond, 1)).toBe(0);
  });

  it('slows down without reversing or overshooting', () => {
    const progress = [0, 0.25, 0.5, 0.75, 1];
    const positions = progress.map(easeOutCubic);
    const speeds = progress.map((value) => getBrakingSpeed(2400, value));

    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(speeds).toEqual([...speeds].sort((a, b) => b - a));
    expect(positions.every((value) => value >= 0 && value <= 1)).toBe(true);
  });

  it('has no remaining duration when already aligned', () => {
    expect(getBrakingDurationMs(0, 2400)).toBe(0);
  });
});
