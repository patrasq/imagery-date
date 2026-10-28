export const GOOGLE_STREET_VIEW_COPY = Object.freeze({
  status: (status: string, message: string | undefined) =>
    message === undefined ? `Street View answered ${status}.` : `Street View answered ${status}: ${message}`,
  unreadableDate: (date: string) => `Street View sent a date this library cannot read: ${date}`,
} as const);
