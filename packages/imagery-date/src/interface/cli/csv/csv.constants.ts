/** RFC 4180 CSV, read leniently (LF or CRLF, a leading byte-order mark) and written strictly. */
export const CSV = Object.freeze({
  delimiter: ',',
  quote: '"',
  escapedQuote: '""',
  newline: '\n',
  carriageReturn: '\r',
  byteOrderMark: '﻿',
  /** A field must be quoted when it holds one of these. */
  needsQuoting: /[",\r\n]/,
  quoteEverywhere: /"/g,
} as const);
