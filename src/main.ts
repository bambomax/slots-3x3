import './style.css';
import {
  createSlotGame,
  type SlotGame,
} from './game/createSlotGame';

let game: SlotGame | undefined;
let disposed = false;

async function main(): Promise<void> {
  const host = document.querySelector<HTMLDivElement>('#app');

  if (!host) {
    throw new Error('#app not found');
  }

  const instance = await createSlotGame(host);

  // Initialization may finish after this module was replaced.
  if (disposed) {
    instance.dispose();
    return;
  }

  game = instance;
}

if (import.meta.hot) {
  import.meta.hot.accept();

  import.meta.hot.dispose(() => {
    disposed = true;
    game?.dispose();
  });
}

void main().catch((error: unknown) => {
  console.error('Failed to start the game:', error);
});
