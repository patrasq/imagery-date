export const IGN_FRANCE_COPY = Object.freeze({
  invalidDay: (host: string, text: string) => `${host} published a flight day this library cannot read: ${text}`,
} as const);
