/** The command line's only contact with the process, so commands run in tests without one. */
export interface CliIo {
  /** Standard output; resolves once the text is accepted, so a slow reader slows the batch instead of filling memory. */
  write(text: string): Promise<void>;
  /** Standard error. */
  warn(text: string): void;
  /** A file's text in chunks; `-` reads standard input. */
  read(path: string): AsyncIterable<string>;
}
