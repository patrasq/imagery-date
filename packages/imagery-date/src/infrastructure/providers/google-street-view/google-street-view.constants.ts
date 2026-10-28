import { CredentialKind } from '../../../domain/provider/credential-kind.enum.ts';
import { ProviderId } from '../../../domain/provider/provider-id.enum.ts';
import type { ProviderDescriptor } from '../../../domain/provider/provider-descriptor.interface.ts';
import { TermsClass } from '../../../domain/provider/terms-class.enum.ts';

export const GOOGLE_STREET_VIEW = Object.freeze({
  /** Street View Static API image metadata: free, and it consumes no quota (Google's documentation). */
  metadataUrl: 'https://maps.googleapis.com/maps/api/streetview/metadata',
  parameters: Object.freeze({ radius: '50', source: 'outdoor' }),
  locationParameter: 'location',
  keyParameter: 'key',
  listSeparator: ',',
  /** `2023-08` or `2023`: the panorama's month, or only its year. */
  date: /^(\d{4})(?:-(\d{2}))?$/,
  productName: 'Street View',
  /** A panorama Google does not own (a photo sphere someone uploaded) is named for what it is. */
  contributedProductName: 'Street View photo by a contributor',
  /** Google's own panoramas are credited `© Google` or `© 2026 Google` (the copyright year, not the capture). */
  googleCopyright: /^©\s*(?:\d{4}\s+)?Google$/,
  fallbackAttribution: '© Google',
  descriptor: Object.freeze({
    id: ProviderId.GoogleStreetView,
    name: 'Google Street View',
    terms: TermsClass.OfficialApiOwnKey,
    credential: CredentialKind.Google,
    billable: false,
    enabledByDefault: true,
    coverage: null,
    attribution: '© Google',
    homepage: 'https://developers.google.com/maps/documentation/streetview/metadata',
  } satisfies ProviderDescriptor),
} as const);
