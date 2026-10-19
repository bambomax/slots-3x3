import type { Column, Matrix, SymbolId } from './model';
import { delay } from './delay';

const RESULTS: readonly Matrix[] = [
  [
    ['bell', 'diamond', 'seven'],
    ['diamond', 'seven', 'bell'],
    ['diamond', 'bell', 'diamond'],
  ],
  [
    ['seven', 'bell', 'diamond'],
    ['bell', 'diamond', 'bell'],
    ['diamond', 'seven', 'seven'],
  ],
  [
    ['seven', 'seven', 'seven'],
    ['seven', 'seven', 'seven'],
    ['seven', 'seven', 'seven'],
  ],
];

type MockSpinMode = 'random' | 'scenarios';

const DEFAULT_MODE: MockSpinMode = 'random';

const RANDOM_SYMBOLS = [
  'cherry',
  'lemon',
  'bell',
  'diamond',
  'seven',
  'plum',
] as const satisfies readonly SymbolId[];

const ERROR_PROBABILITY = 0.1;
const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 1200;

let scenarioCount = 0;

function pickSymbol(): SymbolId {
  const index = Math.floor(Math.random() * RANDOM_SYMBOLS.length);

  return RANDOM_SYMBOLS[index]!;
}

function createRandomColumn(): Column {
  return [pickSymbol(), pickSymbol(), pickSymbol()];
}

function createRandomMatrix(): Matrix {
  return [
    createRandomColumn(),
    createRandomColumn(),
    createRandomColumn(),
  ];
}

export async function requestSpin(
  signal: AbortSignal,
  mode: MockSpinMode = DEFAULT_MODE,
): Promise<Matrix> {
  signal.throwIfAborted();

  if (mode === 'scenarios') {
    const scenarioIndex = scenarioCount % 4;

    scenarioCount += 1;

    await delay(500, signal);

    if (scenarioIndex === 3) {
      throw new Error('Simulated spin request failure');
    }

    const result = RESULTS[scenarioIndex];

    if (!result) {
      throw new Error('Mock spin result not found');
    }

    return result;
  }

  const durationMs =
    MIN_DELAY_MS +
    Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1));

  await delay(durationMs, signal);

  if (Math.random() < ERROR_PROBABILITY) {
    throw new Error('Simulated spin request failure');
  }

  // Generate the outcome only after the simulated request succeeds.
  return createRandomMatrix();
}