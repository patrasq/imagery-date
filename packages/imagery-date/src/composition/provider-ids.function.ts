import { UnknownProviderError } from '../domain/errors/unknown-provider.error.ts';
import { ProviderId } from '../domain/provider/provider-id.enum.ts';
import type { ProviderIdValue } from '../domain/provider/provider-id.type.ts';

const KNOWN: ReadonlySet<string> = new Set(Object.values(ProviderId));
const isProviderId = (name: string): name is ProviderIdValue => KNOWN.has(name);

/** Provider names as IDs. @throws UnknownProviderError naming the first unknown one and listing the known ones. */
export function providerIds(names: readonly string[]): ProviderIdValue[] {
  return names.map((name) => {
    const trimmed = name.trim();
    if (!isProviderId(trimmed)) throw new UnknownProviderError(trimmed, [...KNOWN]);
    return trimmed;
  });
}
