import { CSV } from './csv.constants.ts';
import { CsvState } from './csv-state.enum.ts';
import type { CsvStateValue } from './csv-state.type.ts';

/**
 * Reads CSV text chunk by chunk, whatever the chunk boundaries, into records: quoted fields may hold commas, quotes
 * (doubled) and newlines; CR is ignored outside quotes; blank lines are skipped. One state per position in a field.
 */
export class CsvRecordReader {
  #state: CsvStateValue = CsvState.FieldStart;
  #field = '';
  #record: string[] = [];
  #records: string[][] = [];
  #started = false;
  readonly #handlers: Readonly<Record<CsvStateValue, (character: string) => void>> = {
    [CsvState.FieldStart]: (character) => {
      if (character === CSV.quote) this.#state = CsvState.Quoted;
      else this.#outside(character, CsvState.Unquoted);
    },
    [CsvState.Unquoted]: (character) => {
      this.#outside(character, CsvState.Unquoted);
    },
    [CsvState.Quoted]: (character) => {
      if (character === CSV.quote) this.#state = CsvState.QuoteInQuoted;
      else this.#field += character;
    },
    [CsvState.QuoteInQuoted]: (character) => {
      if (character !== CSV.quote) this.#outside(character, CsvState.Unquoted);
      else {
        this.#field += CSV.quote;
        this.#state = CsvState.Quoted;
      }
    },
  };

  /** The records the chunk completed. */
  push(chunk: string): string[][] {
    const text = this.#started || !chunk.startsWith(CSV.byteOrderMark) ? chunk : chunk.slice(CSV.byteOrderMark.length);
    this.#started = true;
    for (const character of text) this.#handlers[this.#state](character);
    return this.#records.splice(0);
  }

  /** The last record, when the text does not end with a newline. */
  end(): string[][] {
    if (this.#field !== '' || this.#record.length > 0 || this.#state !== CsvState.FieldStart) this.#endRecord();
    return this.#records.splice(0);
  }

  #outside(character: string, next: CsvStateValue): void {
    if (character === CSV.delimiter) this.#endField();
    else if (character === CSV.newline) this.#endRecord();
    else if (character !== CSV.carriageReturn) {
      this.#field += character;
      this.#state = next;
    }
  }

  #endField(): void {
    this.#record.push(this.#field);
    this.#field = '';
    this.#state = CsvState.FieldStart;
  }

  #endRecord(): void {
    this.#endField();
    const blank = this.#record.length === 1 && this.#record[0] === '';
    if (!blank) this.#records.push(this.#record);
    this.#record = [];
  }
}
