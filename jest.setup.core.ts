// Ensure zero-delay timers flush under fake timers
const originalSetTimeout = global.setTimeout as typeof setTimeout;

// @ts-ignore -- we intentionally widen the signature to align with Node
global.setTimeout = (callback: Parameters<typeof setTimeout>[0], ms?: number, ...args: Parameters<typeof setTimeout>[2][]) => {
  const safeDelay = ms === 0 ? 1 : ms;
  return originalSetTimeout(callback, safeDelay, ...args);
};

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
