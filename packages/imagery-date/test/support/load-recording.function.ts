import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Recording } from '../../src/testing/recording.interface.ts';
import { recordingSchema } from './recording.schema.ts';
import { SUPPORT } from './support.constants.ts';

/** `test/recordings/<provider>/<slug>.recording.json`, validated. */
export function loadRecording(provider: string, slug: string): Recording {
  const url = new URL(
    [SUPPORT.recordingsPath, provider, slug + SUPPORT.recordingExtension].join(SUPPORT.pathSeparator),
    import.meta.url,
  );
  return recordingSchema.parse(JSON.parse(readFileSync(fileURLToPath(url), SUPPORT.encoding)));
}
