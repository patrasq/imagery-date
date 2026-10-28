/** Why a value was refused. Every `ImageryDateError` carries one, so callers branch on codes, never on messages. */
export const ErrorCode = Object.freeze({
  InvalidCoordinates: 'invalid-coordinates',
  InvalidZoom: 'invalid-zoom',
  InvalidCalendarDay: 'invalid-calendar-day',
  InvalidDateRange: 'invalid-date-range',
  UnknownProvider: 'unknown-provider',
} as const);
