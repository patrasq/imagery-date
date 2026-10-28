export const BING_COPY = Object.freeze({
  unreadableRange: (value: string) => `Bing sent a capture range this library cannot read: ${value}`,
} as const);
