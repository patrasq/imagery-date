import { CsvRecordReader } from './csv-record-reader.service.ts';

/** The records of a CSV text stream, as they complete: memory holds one chunk, never the file. */
export async function* csvRecords(chunks: AsyncIterable<string>): AsyncGenerator<string[]> {
  const reader = new CsvRecordReader();
  for await (const chunk of chunks) yield* reader.push(chunk);
  yield* reader.end();
}
