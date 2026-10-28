/** Messages of the errors the domain throws. */
export const DOMAIN_ERRORS_COPY = Object.freeze({
  invalidCoordinates: (latitude: number, longitude: number) =>
    `Latitude must be within -90..90 and longitude within -180..180; got ${String(latitude)}, ${String(longitude)}.`,
  invalidZoom: (zoom: number, maximum: number) =>
    `Zoom must be a whole number from 0 to ${String(maximum)}; got ${String(zoom)}.`,
  invalidCalendarDay: (text: string) => `Not a calendar day: ${text}.`,
  invalidDateRange: (start: string, end: string) => `A date range must not end before it starts: ${start}/${end}.`,
  unknownProvider: (name: string, known: readonly string[]) =>
    `Unknown provider "${name}". Known providers: ${known.join(', ')}.`,
} as const);
