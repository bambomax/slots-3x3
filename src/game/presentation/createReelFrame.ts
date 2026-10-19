import { Graphics } from 'pixi.js';
import { GAME_CONFIG } from '../config';

export function createReelFrame() {
  const { columns, rows, cellSize } = GAME_CONFIG;

  const width = columns * cellSize;
  const height = rows * cellSize;

  const background = new Graphics()
    .rect(0, 0, width, height)
    .fill(0x101820);

  const frame = new Graphics();

  // Draw a solid outer rim with a transparent reel window.
  frame
    .roundRect(-20, -20, width + 40, height + 40, 24)
    .fill(0x11151e)
    .rect(0, 0, width, height)
    .cut();

  frame
    .roundRect(-12, -12, width + 24, height + 24, 16)
    .stroke({
      color: 0xd6a647,
      width: 4,
    });

  frame
    .roundRect(-17, -17, width + 34, height + 34, 21)
    .stroke({
      color: 0xffdf91,
      width: 1,
      alpha: 0.45,
    });

  // Add an inner edge without covering the symbols.
  frame
    .rect(0, 0, width, height)
    .stroke({
      color: 0xffdf91,
      width: 2,
      alpha: 0.7,
    });

  for (let column = 1; column < columns; column++) {
    const x = column * cellSize;

    frame
      .moveTo(x, 0)
      .lineTo(x, height)
      .stroke({
        color: 0x080d14,
        width: 6,
      });

    frame
      .moveTo(x, 0)
      .lineTo(x, height)
      .stroke({
        color: 0xd6a647,
        width: 1,
        alpha: 0.65,
      });
  }

  return { background, frame };
}
