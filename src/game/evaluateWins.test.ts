import { describe, expect, it } from 'vitest';
import { evaluateWins } from './evaluateWins';
import type { Matrix } from './model';

describe('evaluateWins', () => {
  it('returns no wins when no line matches', () => {
    const matrix: Matrix = [
      ['bell', 'diamond', 'seven'],
      ['diamond', 'seven', 'bell'],
      ['diamond', 'bell', 'diamond'],
    ];

    expect(evaluateWins(matrix)).toEqual([]);
  });

  it('detects the upward diamond diagonal', () => {
    const matrix: Matrix = [
      ['seven', 'bell', 'diamond'],
      ['bell', 'diamond', 'bell'],
      ['diamond', 'seven', 'seven'],
    ];

    expect(evaluateWins(matrix)).toEqual([
      { lineIndex: 4, symbolId: 'diamond' },
    ]);
  });

  it('returns all five winning lines', () => {
    const matrix: Matrix = [
      ['seven', 'seven', 'seven'],
      ['seven', 'seven', 'seven'],
      ['seven', 'seven', 'seven'],
    ];

    expect(evaluateWins(matrix)).toEqual([
      { lineIndex: 0, symbolId: 'seven' },
      { lineIndex: 1, symbolId: 'seven' },
      { lineIndex: 2, symbolId: 'seven' },
      { lineIndex: 3, symbolId: 'seven' },
      { lineIndex: 4, symbolId: 'seven' },
    ]);
  });

  it('the middle should have the same symbol', () => {
    const matrix: Matrix = [
      ['seven', 'seven', 'seven'],
      ['diamond', 'seven', 'diamond'],
      ['bell', 'seven', 'bell'],
    ];

    expect(evaluateWins(matrix)).toEqual([
      { lineIndex: 1, symbolId: 'seven' },
    ]);
  });
});
