import { describe, expect, it } from 'vitest';
import { CsvRecordReader } from './csv-record-reader.service.ts';
import { formatCsvRecord } from './format-csv-record.function.ts';

const readAll = (text: string, chunkSize: number): string[][] => {
  const reader = new CsvRecordReader();
  const records: string[][] = [];
  for (let start = 0; start < text.length; start += chunkSize)
    records.push(...reader.push(text.slice(start, start + chunkSize)));
  return [...records, ...reader.end()];
};

const TEXT = '﻿id,name,note\r\n1,"Smith, J","said ""hi""\nthen left"\r\n\n2,plain,\n3,"",x';
const RECORDS = [
  ['id', 'name', 'note'],
  ['1', 'Smith, J', 'said "hi"\nthen left'],
  ['2', 'plain', ''],
  ['3', '', 'x'],
];

describe(CsvRecordReader.name, () => {
  it.each([1, 2, 3, 5, 64])(
    'reads quoted commas, escaped quotes, newlines, CRLF, a BOM and blank lines in chunks of %d',
    (size) => {
      expect(readAll(TEXT, size)).toEqual(RECORDS);
    },
  );

  it('keeps going after a malformed quote instead of losing the row', () => {
    expect(readAll('a,"b"c,d\n', 4)).toEqual([['a', 'bc', 'd']]);
  });

  it('reads nothing from nothing, and a lone trailing delimiter as an empty field', () => {
    expect(readAll('', 3)).toEqual([]);
    expect(readAll('a,', 3)).toEqual([['a', '']]);
  });
});

describe(formatCsvRecord.name, () => {
  it('quotes only fields that need it and round-trips through the reader', () => {
    const line = formatCsvRecord(['plain', 'a,b', 'say "x"', 'two\nlines', '']);
    expect(line).toBe('plain,"a,b","say ""x""","two\nlines",\n');
    expect(readAll(line, 2)).toEqual([['plain', 'a,b', 'say "x"', 'two\nlines', '']]);
  });
});
