/** Where the CSV reader is inside a field. */
export const CsvState = Object.freeze({
  FieldStart: 'field-start',
  Unquoted: 'unquoted',
  Quoted: 'quoted',
  /** A quote inside a quoted field: either the field's end, or the first half of an escaped quote. */
  QuoteInQuoted: 'quote-in-quoted',
} as const);
