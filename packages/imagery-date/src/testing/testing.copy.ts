/** Messages of the test fakes. */
export const TESTING_COPY = Object.freeze({
  unrecordedRequest: (key: string, known: readonly string[]) =>
    `No recorded response for ${key}. Recorded requests:\n${known.join('\n')}`,
  aborted: 'The wait was cancelled.',
} as const);
