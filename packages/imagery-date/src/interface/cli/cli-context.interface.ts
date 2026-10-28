import type { ImageryDateClient } from '../../composition/imagery-date-client.interface.ts';
import type { CliIo } from './cli-io.interface.ts';

export interface CliContext {
  readonly client: ImageryDateClient;
  readonly io: CliIo;
  readonly version: string;
}
