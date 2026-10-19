# Slot 3×3

A slot frontend demo built with PixiJS, TypeScript, and Vite. Reels start immediately while an asynchronous local mock generates the outcome, then stop on the returned matrix.

## Getting started

Use Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the address printed by Vite.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm test` | Run the Vitest suite once |
| `npm run build` | Run TypeScript checks and create `dist/` |
| `npm run preview` | Serve the production build locally |

## Features

- Three reels with three visible symbols each.
- Downward scrolling with an individual speed per reel.
- Immediate visual feedback while waiting for the mock response.
- Exact stops on the returned outcome, preserving position and initial braking speed.
- Vertical blur that decreases with reel speed.
- Five paylines: three horizontal lines and two diagonals.
- Sequential win presentation: one second per line, gold outlines, and dimmed non-winning symbols.
- Forward alignment to cell boundaries after a failed request, followed by Retry.
- Responsive scaling, a procedural frame, and a native HTML button.
- Animation pause when the page is hidden.
- Abortable mock requests and explicit resource cleanup.

A line wins when all three symbols match. There are no wild or scatter rules.

## Architecture

```text
src/
  main.ts                       Startup and Vite HMR lifecycle
  game/
    createSlotGame.ts           Game assembly and phase transitions
    config.ts                  Layout and animation settings
    model.ts                   Symbol, matrix, and payline types
    loadSymbolTextures.ts      Parallel PNG loading
    requestSpin.ts             Random and scripted mock outcomes
    delay.ts                   Abortable simulated latency
    buildReelStrip.ts          Planned stopping strip
    evaluateWins.ts            Pure payline evaluation
    reels/
      createReel.ts            Sprites, mask, blur, and reel cleanup
      types.ts                 Reel state
      renderReel.ts            Texture selection and sprite positioning
      createLoopMotion.ts      Continuous motion and error recovery
      updateReels.ts           Timed braking
      getLoopWindow.ts         Circular strip sampling
      visualStrip.ts           Animation symbol sequence
    presentation/
      createWinPresenter.ts    Sequential highlights and dimming
      createReelFrame.ts       Static Graphics background and frame
  ui/
    createControls.ts          Spin/Retry button and its listener
    createLayout.ts            Canvas scaling and resize subscriptions
```

Modules use factory functions with small public interfaces. Pure calculations are separate from PixiJS rendering and DOM controls.

### Data and rendering

A matrix is column-major: `matrix[reel][row]`. Rows run from top to bottom.

Each reel owns five reusable sprites: three visible symbols plus one buffer above and below. The same sprites display successive windows of symbol IDs; spinning does not create sprites for every strip element.

Sprite slots stay in top-to-bottom order. Internal strip windows are read in reverse for downward motion. `Column` values returned by the mock remain top-to-bottom.

The visual strip supplies animation symbols only. It does not determine the returned outcome or its probabilities.

## Spin lifecycle

```text
idle / error
  -> requesting: continuous visual motion and an active mock request
     -> success -> spinning: brake onto the returned matrix
        -> no win -> idle
        -> wins -> presenting -> idle
     -> failure -> recovering: align reels forwards to cell boundaries
        -> error: enable Retry
```

Spin is disabled during requesting, braking, recovery, and win presentation.

Braking uses cubic ease-out. Its duration is calculated from the remaining distance and the reel speed:

```text
durationSeconds = 3 * remainingDistance / speed
```

This matches the initial braking speed to the preceding continuous motion.

Visibility changes stop and restart the PixiJS application without resetting the game phase. The mock request may finish while the page is hidden; animation resumes when the page becomes visible.

`dispose()` aborts the active request, removes listeners and observers, and destroys the owned scene objects and filters. Textures loaded through the shared Assets cache are retained.

## Mock modes

Set `DEFAULT_MODE` in `src/game/requestSpin.ts` and rebuild.

| Mode | Behavior |
| --- | --- |
| `random` | Default: 300–1200 ms latency, 10% error probability, independent uniform selection from six symbols |
| `scenarios` | Repeating sequence: no win, one diamond diagonal, all five seven lines, request failure; 500 ms latency |

Random outcomes use cherry, lemon, bell, diamond, seven, and plum. The animation strip uses all 16 loaded symbols.

Errors are intentional. Their probability does not imply exactly one failure every ten requests. Reloading the app resets the scripted sequence.

## Testing

Unit tests cover payline evaluation, stopping-strip construction, circular windows, abortable delays, mock success/failure/cancellation, and recovery alignment. Random tests replace `Math.random` so results are repeatable.

Recovery tests mock rendering; they do not verify GPU output. There is no automated browser test suite.

For a manual check, use `scenarios` to verify the full sequence, then test resizing, tab switching, blur removal, Retry, and module replacement. Repeat the core flow with `npm run preview`.

## Deployment

Run `npm run build` and publish `dist/` to a static host. No backend is required. Rebuild after changing mock mode or configuration.

## Limitations

- Local mock only; there is no HTTP API or server authority.
- No bets, balance, payouts, RTP model, or production RNG.
- No Spine animations, audio, or round persistence.
- Cancellation stops local waiting; a real server integration would require round recovery and duplicate-request handling.
- Initialization failures are logged; there is no dedicated loading/error screen.
- The layout is designed for a fixed 3×3 matrix.

## Asset credits

UI assets by [Ville Seppänen](https://www.villeseppanen.com).

Symbol pack: [Slots Symbols - Free Game Asset Pack](https://villesep.itch.io/slots-symbols-free-game-asset-pack).

Licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

The game applies runtime scaling, tinting, and blur effects to the symbol artwork.

The reel frame is drawn with PixiJS Graphics.
