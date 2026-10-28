/** Failure details the HTTP stack writes. They name the host, never the full URL, so keys never leak into reports. */
export const HTTP_COPY = Object.freeze({
  timeout: (host: string, milliseconds: number) => `${host} did not answer within ${String(milliseconds)} ms.`,
  network: (host: string, message: string) => `Could not reach ${host}: ${message}`,
  aborted: 'The lookup was cancelled.',
  status: (host: string, status: number) => `${host} answered with HTTP ${String(status)}.`,
  notJson: (host: string) => `${host} did not answer with JSON.`,
  unexpectedShape: (host: string, issues: string) => `${host} answered in an unknown shape: ${issues}`,
} as const);
