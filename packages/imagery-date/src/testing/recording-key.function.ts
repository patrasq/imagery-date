import type { HttpMethodValue } from '../application/ports/http-method.type.ts';
import { redactedUrl } from './redacted-url.function.ts';
import { TESTING } from './testing.constants.ts';

/** `GET https://…?a=1&b=2`: how a recorded exchange is matched to a request, secrets removed. */
export function recordingKey(method: HttpMethodValue, url: URL | string): string {
  return [method, redactedUrl(url)].join(TESTING.keySeparator);
}
