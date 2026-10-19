import { Application, Container } from 'pixi.js';
import type { Matrix, SymbolId } from './model';
import { evaluateWins } from './evaluateWins';
import { requestSpin } from './requestSpin';
import { GAME_CONFIG } from './config';
import { loadSymbolTextures } from './loadSymbolTextures';
import { createReel, type Reel } from './reels/createReel';
import { updateReels } from './reels/updateReels';
import { prepareReelsStop } from './reels/prepareReelsStop';
import { createWinPresenter } from './presentation/createWinPresenter';
import { createControls } from '../ui/createControls';
import { createLayout } from '../ui/createLayout';
import { createLoopMotion } from './reels/createLoopMotion';
import { createReelFrame } from './presentation/createReelFrame';

type GamePhase =
  | 'idle'
  | 'requesting'
  | 'spinning'
  | 'presenting'
  | 'recovering'
  | 'error';

export type SlotGame = {
  dispose: () => void;
};

export async function createSlotGame(
  host: HTMLElement,
): Promise<SlotGame> {
  const {
    designWidth,
    designHeight,
    columns,
    rows,
    cellSize,
    background,
    baseSpinSteps,
    extraStepsPerReel,
    baseReelSpeedPxPerSecond,
    reelSpeedIncrementPxPerSecond,
  } = GAME_CONFIG;

  const app = new Application();

  await app.init({
    width: designWidth,
    height: designHeight,
    background,
    antialias: true,
    preference: 'webgl',
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  });

  host.appendChild(app.canvas);

  const textures = await loadSymbolTextures();

  const initialStrip: readonly SymbolId[] = [
    'diamond',
    'bell',
    'seven',
    'diamond',
    'bell',
  ];

  let result: Matrix | null = null;

  const boardWidth = columns * cellSize;
  const boardHeight = rows * cellSize;

  const board = new Container();

  board.position.set(
    (designWidth - boardWidth) / 2,
    (designHeight - boardHeight) / 2,
  );

  app.stage.addChild(board);

  const reelFrame = createReelFrame();

  board.addChild(reelFrame.background);

  const reels: Reel[] = [];

  for (let column = 0; column < columns; column++) {
    const reel = createReel({
      textures,
      initialWindow: initialStrip,
      speedPxPerSecond:
        baseReelSpeedPxPerSecond +
        column * reelSpeedIncrementPxPerSecond,
      distancePx:
        cellSize * (baseSpinSteps + column * extraStepsPerReel),
    });

    reel.container.x = column * cellSize;

    board.addChild(reel.container);
    reels.push(reel);
  }

  const loopMotion = createLoopMotion(reels, textures);

  board.addChild(reelFrame.frame);

  const winPresenter = createWinPresenter(board, reels);

  let elapsedMs = 0;
  let phase: GamePhase = 'idle';
  let disposed = false;
  let activeRequest: AbortController | undefined;
  let skipNextFrame = false;

  const controls = createControls(host, () => {
    void onSpinClick();
  });

  const { spinButton } = controls;

  const layout = createLayout({
    app,
    host,
    spinButton,
  });

  const onSpinClick = async (): Promise<void> => {
    if (disposed || (phase !== 'idle' && phase !== 'error')) {
      return;
    }

    phase = 'requesting';
    spinButton.disabled = true;
    spinButton.textContent = 'Spin';

    winPresenter.clear();

    loopMotion.start();

    const controller = new AbortController();

    activeRequest = controller;

    try {
      const nextResult = await requestSpin(controller.signal);

      if (disposed) {
        return;
      }

      loopMotion.stop();

      prepareReelsStop(reels, nextResult);

      result = nextResult;
      elapsedMs = 0;
      phase = 'spinning';
    } catch (error: unknown) {
      if (disposed) {
        return;
      }

      console.error('Failed to request spin result:', error);

      result = null;

      loopMotion.beginRecovery();

      phase = 'recovering';
    } finally {
      if (activeRequest === controller) {
        activeRequest = undefined;
      }
    }
  };

  app.ticker.add((ticker) => {
    if (skipNextFrame) {
      skipNextFrame = false;
      return;
    }

    if (phase === 'requesting') {
      loopMotion.update(ticker.deltaMS);
      return;
    }

    if (phase === 'recovering') {
      const finished = loopMotion.updateRecovery(ticker.deltaMS);

      if (finished) {
        phase = 'error';

        spinButton.disabled = false;
        spinButton.textContent = 'Retry';
      }

      return;
    }

    if (phase === 'presenting') {
      const finished = winPresenter.update(ticker.deltaMS);

      if (finished) {
        phase = 'idle';
        spinButton.disabled = false;
      }

      return;
    }

    if (phase !== 'spinning') {
      return;
    }

    elapsedMs += ticker.deltaMS;

    const allStopped = updateReels(reels, textures, elapsedMs);

    if (!allStopped) {
      return;
    }

    if (result === null) {
      throw new Error('Spin completed without a result');
    }

    const wins = evaluateWins(result);

    if (wins.length === 0) {
      phase = 'idle';
      spinButton.disabled = false;
      return;
    }

    winPresenter.start(wins);
    phase = 'presenting';
  });

  const onVisibilityChange = (): void => {
    if (disposed) {
      return;
    }

    if (document.hidden) {
      app.stop();
      return;
    }

    skipNextFrame = true;
    app.start();
  };

  document.addEventListener(
    'visibilitychange',
    onVisibilityChange,
  );

  onVisibilityChange();

  const dispose = (): void => {
    if (disposed) {
      return;
    }

    disposed = true;
    loopMotion.stop();

    activeRequest?.abort();
    activeRequest = undefined;

    document.removeEventListener(
      'visibilitychange',
      onVisibilityChange,
    );

    layout.destroy();

    app.stop();
    winPresenter.destroy();
    reels.forEach((reel) => {
      reel.destroy();
    });
    app.destroy(
      { removeView: true },
      { children: true },
    );

    controls.destroy();
  };

  return { dispose };
}
