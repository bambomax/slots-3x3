import type {
  Matrix,
  Payline,
  WinningLine,
} from './model';

export const PAYLINES: readonly Payline[] = [
  [0, 0, 0], // Top row
  [1, 1, 1], // Middle row
  [2, 2, 2], // Bottom row
  [0, 1, 2], // Top-left to bottom-right
  [2, 1, 0], // Bottom-left to top-right
];

export function evaluateWins(matrix: Matrix): WinningLine[] {
  const wins: WinningLine[] = [];

  PAYLINES.forEach((payline, lineIndex) => {
    const [firstRow, secondRow, thirdRow] = payline;

    const first = matrix[0][firstRow];
    const second = matrix[1][secondRow];
    const third = matrix[2][thirdRow];

    if (first === second && second === third) {
      wins.push({
        lineIndex,
        symbolId: first,
      });
    }
  });

  return wins;
}
