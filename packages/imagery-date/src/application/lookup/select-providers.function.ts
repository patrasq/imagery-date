import { FailureCode } from '../../domain/outcome/failure-code.enum.ts';
import type { ProviderFailure } from '../../domain/outcome/provider-failure.interface.ts';
import type { Credentials } from '../../domain/provider/credentials.type.ts';
import type { ProviderIdValue } from '../../domain/provider/provider-id.type.ts';
import type { ImageryDateProvider } from '../ports/imagery-date-provider.port.ts';
import { LOOKUP_COPY } from './lookup.copy.ts';
import type { ProviderPlan } from './provider-plan.interface.ts';
import type { ProviderRegistry } from './provider-registry.type.ts';

const byDefault = (provider: ImageryDateProvider): boolean =>
  provider.descriptor.enabledByDefault && !provider.descriptor.billable;

function skipReason(provider: ImageryDateProvider, credentials: Credentials): ProviderFailure | null {
  const { credential, name } = provider.descriptor;
  if (credential === null || credentials[credential] !== undefined) return null;
  return { code: FailureCode.MissingCredential, detail: LOOKUP_COPY.missingCredential(name, credential) };
}

/**
 * The providers a lookup asks, in registry order: the named ones, or every provider enabled by default. Billable
 * providers run only when named. A provider whose key is missing is planned as skipped, so the report says why.
 */
export function selectProviders(
  registry: ProviderRegistry,
  named: readonly ProviderIdValue[] | null,
  credentials: Credentials,
): ProviderPlan[] {
  const wanted = named === null ? null : new Set(named);
  return [...registry.entries()]
    .filter(([id, provider]) => (wanted === null ? byDefault(provider) : wanted.has(id)))
    .map(([, provider]) => ({ provider, skip: skipReason(provider, credentials) }));
}
