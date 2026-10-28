export const ARCGIS_COPY = Object.freeze({
  serviceError: (host: string, code: number, message: string) =>
    `${host} answered with error ${String(code)}: ${message}`,
  missingFeatures: (host: string) => `${host} answered without features.`,
  invalidDate: (host: string, value: number) => `${host} published an impossible capture date: ${String(value)}.`,
} as const);
