import type { BoundingBox } from '../geo/bounding-box.value-object.ts';
import type { CredentialKindValue } from './credential-kind.type.ts';
import type { ProviderIdValue } from './provider-id.type.ts';
import type { TermsClassValue } from './terms-class.type.ts';

/** What a provider is, what it needs and where it can answer. Its date source and terms are in PROVIDERS.md. */
export interface ProviderDescriptor {
  readonly id: ProviderIdValue;
  readonly name: string;
  readonly terms: TermsClassValue;
  /** The key it needs, or null when it needs none. */
  readonly credential: CredentialKindValue | null;
  /** True when a lookup can be billed to the caller: it then runs only when asked for by name. */
  readonly billable: boolean;
  /** Runs when the caller names no providers (billable providers never do). */
  readonly enabledByDefault: boolean;
  /** Where it has imagery at all, as coarse boxes; null for the whole world. Outside them it is not called. */
  readonly coverage: readonly BoundingBox[] | null;
  /** The credit line its terms ask for. */
  readonly attribution: string;
  readonly homepage: string;
}
