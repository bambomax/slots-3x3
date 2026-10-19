import type { Sprite } from 'pixi.js';
import type { SymbolId } from '../model';

export type ReelState = {
  symbols: Sprite[];
  stripIds: SymbolId[];
  offset: number;
  durationMs: number;
  distancePx: number;
  startOffsetPx: number;
  speedPxPerSecond: number;
  setMotionBlur: (speedPxPerSecond: number) => void;
};
