import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { requestSpin } from './requestSpin';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('requestSpin', () => {
  it('returns a generated 3×3 matrix on success', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const controller = new AbortController();
    const pending = requestSpin(controller.signal, 'random');

    await vi.advanceTimersByTimeAsync(1200);

    await expect(pending).resolves.toEqual([
      ['diamond', 'diamond', 'diamond'],
      ['diamond', 'diamond', 'diamond'],
      ['diamond', 'diamond', 'diamond'],
    ]);
  });

  it('simulates a request failure', async () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5) // Request duration
      .mockReturnValueOnce(0); // Failure probability check

    const controller = new AbortController();
    const pending = requestSpin(controller.signal, 'random');

    const rejection = expect(pending).rejects.toThrow(
      'Simulated spin request failure',
    );

    await vi.advanceTimersByTimeAsync(1200);

    await rejection;
  });

  it('cancels a pending request and removes its timer', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const controller = new AbortController();
    const pending = requestSpin(controller.signal, 'random');

    const rejection = expect(pending).rejects.toMatchObject({
      name: 'AbortError',
    });

    controller.abort();

    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });
});