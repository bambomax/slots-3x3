import { Container, Graphics } from 'pixi.js';
import { GAME_CONFIG } from '../config';
import { PAYLINES } from '../evaluateWins';
import type { WinningLine } from '../model';
import type { ReelState } from '../reels/types';

export function createWinPresenter(
  board: Container,
  reels: readonly ReelState[],
) {
  const overlay = new Graphics();

  board.addChild(overlay);

  let destroyed = false;
  let wins: readonly WinningLine[] = [];
  let currentIndex = 0;
  let elapsedMs = 0;

  const resetVisuals = (): void => {
    overlay.clear();

    reels.forEach((reel) => {
      reel.symbols.forEach((symbol) => {
        symbol.tint = 0xffffff;
      });
    });
  };

  const clear = (): void => {
    if (destroyed) {
      return;
    }

    wins = [];
    currentIndex = 0;
    elapsedMs = 0;

    resetVisuals();
  };

  const showCurrentLine = (): void => {
    resetVisuals();

    const win = wins[currentIndex];
    const payline = win ? PAYLINES[win.lineIndex] : undefined;

    if (!payline) {
      throw new Error('Unknown payline');
    }

    const { cellSize, rows } = GAME_CONFIG;
    const padding = 6;

    reels.forEach((reel, column) => {
      for (let row = 0; row < rows; row++) {
        // Sprite 0 is the top buffer; visible sprites start at 1.
        const symbol = reel.symbols[row + 1];

        symbol.tint = payline[column] === row
          ? 0xffffff
          : 0x666666;
      }
    });

    payline.forEach((row, column) => {
      overlay
        .roundRect(
          column * cellSize + padding,
          row * cellSize + padding,
          cellSize - padding * 2,
          cellSize - padding * 2,
          10,
        )
        .stroke({
          color: 0xffc857,
          width: 3,
        });
    });
  };

  const start = (nextWins: readonly WinningLine[]): void => {
    if (destroyed) {
      return;
    }

    clear();
    wins = [...nextWins];

    if (wins.length > 0) {
      showCurrentLine();
    }
  };

  const update = (deltaMs: number): boolean => {
    if (destroyed || wins.length === 0) {
      return true;
    }

    elapsedMs += deltaMs;

    // Preserve leftover time when advancing between lines.
    while (elapsedMs >= GAME_CONFIG.winLineDurationMs) {
      elapsedMs -= GAME_CONFIG.winLineDurationMs;
      currentIndex += 1;

      if (currentIndex >= wins.length) {
        clear();
        return true;
      }

      showCurrentLine();
    }

    return false;
  };

  const destroy = (): void => {
    if (destroyed) {
      return;
    }

    clear();
    destroyed = true;

    overlay.removeFromParent();
    overlay.destroy();
  };

  return { start, update, clear, destroy };
}
