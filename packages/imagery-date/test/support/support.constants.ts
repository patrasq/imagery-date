export const SUPPORT = Object.freeze({
  recordingsPath: '../recordings',
  recordingExtension: '.recording.json',
  encoding: 'utf8',
  pathSeparator: '/',
  /** 2026-10-28T12:00:00.000Z: the moment every recorded test lookup happens. */
  epochMilliseconds: 1_793_188_800_000,
  googleKey: 'test-key-not-real',
  version: '0.1.0',
  /** Files reach the CLI in chunks this small, so every chunk boundary is exercised. */
  chunkSize: 7,
} as const);
