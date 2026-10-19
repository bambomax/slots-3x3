import { GAME_CONFIG } from '../config';
import type { SymbolTextures } from '../loadSymbolTextures';
import type { ReelState } from './types';

export function renderReel(
  reel: ReelState,
  textures: SymbolTextures,
): void {
  const { cellSize, symbolSize } = GAME_CONFIG;

  const firstIndex = Math.floor(reel.offset / cellSize);
  const shift = reel.offset - firstIndex * cellSize;

  reel.symbols.forEach((symbol, index) => {
    // Read strip data in reverse while keeping sprites top-to-bottom.
    const windowIndex = reel.symbols.length - 1 - index;
    const symbolId = reel.stripIds[firstIndex + windowIndex];

    if (symbolId === undefined) {
      throw new Error('Symbol index is outside the reel strip');
    }

    const texture = textures[symbolId];

    if (symbol.texture !== texture) {
      symbol.texture = texture;

      // Texture dimensions stay unchanged between texture replacements.
      symbol.scale.set(
        Math.min(
          symbolSize / texture.width,
          symbolSize / texture.height,
        ),
      );
    }

    symbol.y =
      (index - 1) * cellSize +
      cellSize / 2 +
      shift;
  });
}
