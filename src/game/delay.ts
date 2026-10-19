export function delay(
  durationMs: number,
  signal: AbortSignal,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }

    const onAbort = (): void => {
      clearTimeout(timerId);
      signal.removeEventListener('abort', onAbort);

      reject(signal.reason);
    };

    const timerId = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, durationMs);

    signal.addEventListener('abort', onAbort, { once: true });
  });
}
