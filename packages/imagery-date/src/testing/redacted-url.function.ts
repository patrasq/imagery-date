import { TESTING } from './testing.constants.ts';

/** The URL with its parameters sorted and its secrets (`key`, `token`) removed, so it is safe to commit. */
export function redactedUrl(url: URL | string): string {
  const copy = new URL(url);
  for (const name of TESTING.redactedParameters) copy.searchParams.delete(name);
  copy.searchParams.sort();
  return copy.href;
}
