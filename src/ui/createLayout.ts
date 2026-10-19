import type { Application } from 'pixi.js';
import { GAME_CONFIG } from '../game/config';

type LayoutOptions = {
  app: Application;
  host: HTMLElement;
  spinButton: HTMLButtonElement;
};

export function createLayout({ app, host, spinButton }: LayoutOptions) {
  const { designWidth, designHeight } = GAME_CONFIG;

  let destroyed = false;

  const update = (): void => {
    if (destroyed) {
      return;
    }

    const pagePadding = 16;
    const gap = 16;

    // Reserve space for the button and the gap below the canvas.
    const controlsHeight = spinButton.offsetHeight + gap;

    const availableWidth = Math.max(1, host.clientWidth);

    const availableHeight = Math.max(
      1,
      window.innerHeight - pagePadding * 2 - controlsHeight,
    );

    const scale = Math.min(
      availableWidth / designWidth,
      availableHeight / designHeight,
      1,
    );

    app.renderer.resize(
      designWidth * scale,
      designHeight * scale,
      Math.min(window.devicePixelRatio || 1, 2),
    );

    app.stage.scale.set(scale);
  };

  const observer = new ResizeObserver(update);

  observer.observe(spinButton);

  window.addEventListener('resize', update);

  update();

  const destroy = (): void => {
    if (destroyed) {
      return;
    }

    destroyed = true;

    window.removeEventListener('resize', update);
    observer.disconnect();
  };

  return { update, destroy };
}
