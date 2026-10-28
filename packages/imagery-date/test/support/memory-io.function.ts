import type { CliIo } from '../../src/interface/cli/cli-io.interface.ts';
import { SUPPORT } from './support.constants.ts';

interface MemoryIo {
  readonly io: CliIo;
  readonly output: () => string;
  readonly errors: () => string;
}

/** A CLI process in memory: files are served in chunks of `chunkSize` characters, so chunk boundaries get tested. */
export function memoryIo(
  files: Readonly<Record<string, string>> = {},
  chunkSize: number = SUPPORT.chunkSize,
): MemoryIo {
  const out: string[] = [];
  const err: string[] = [];
  async function* read(path: string): AsyncGenerator<string> {
    const text = files[path] ?? '';
    for (let start = 0; start < text.length; start += chunkSize) {
      await Promise.resolve();
      yield text.slice(start, start + chunkSize);
    }
  }
  const io: CliIo = {
    write: (text) => {
      out.push(text);
      return Promise.resolve();
    },
    warn: (text) => {
      err.push(text);
    },
    read,
  };
  return { io, output: () => out.join(''), errors: () => err.join('') };
}
