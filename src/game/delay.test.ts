import { afterEach, describe, expect, it, vi } from 'vitest';
import { delay } from './delay';

afterEach(() => {
  vi.useRealTimers();
});

describe('delay', () => {
  it('finishes after the requested duration', async () => {
    vi.useFakeTimers();

    const controller = new AbortController();
    const pending = delay(500, controller.signal);

    await vi.advanceTimersByTimeAsync(500);

    await expect(pending).resolves.toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels a pending timer', async () => {
    vi.useFakeTimers();

    const controller = new AbortController();
    const pending = delay(500, controller.signal);

    const rejection = expect(pending).rejects.toMatchObject({
      name: 'AbortError',
    });

    controller.abort();

    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not start a timer for an aborted signal', async () => {
    vi.useFakeTimers();

    const controller = new AbortController();

    controller.abort();

    await expect(
      delay(500, controller.signal),
    ).rejects.toMatchObject({
      name: 'AbortError',
    });

    expect(vi.getTimerCount()).toBe(0);
  });
});