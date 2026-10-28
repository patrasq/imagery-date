import { CredentialKind } from '../../../domain/provider/credential-kind.enum.ts';
import { ProviderId } from '../../../domain/provider/provider-id.enum.ts';
import type { ProviderDescriptor } from '../../../domain/provider/provider-descriptor.interface.ts';
import { TermsClass } from '../../../domain/provider/terms-class.enum.ts';

export const GOOGLE_SOLAR = Object.freeze({
  /** Solar API buildingInsights for the building nearest the point: billed per request beyond Google's free tier. */
  findClosestUrl: 'https://solar.googleapis.com/v1/buildingInsights:findClosest',
  latitudeParameter: 'location.latitude',
  longitudeParameter: 'location.longitude',
  qualityParameter: 'requiredQuality',
  /** The lowest quality accepted; Google answers with the best it has. */
  minimumQuality: 'LOW',
  keyParameter: 'key',
  /** Google's partial-response mask: only the fields read here, not the whole roof analysis (megabytes). */
  fieldsParameter: 'fields',
  fields: 'imageryDate,imageryQuality,center',
  /** No building with Solar data near the point. */
  noBuildingStatus: 404,
  refusedStatuses: new Set([401, 403, 429]),
  /** Google's Date leaves a month or day it does not know at 0. */
  unknownPart: 0,
  productName: 'Solar API imagery',
  qualityOpen: ' (',
  qualityClose: ')',
  descriptor: Object.freeze({
    id: ProviderId.GoogleSolar,
    name: 'Google Solar API',
    terms: TermsClass.OfficialApiOwnKey,
    credential: CredentialKind.Google,
    billable: true,
    enabledByDefault: false,
    coverage: null,
    attribution: '© Google',
    homepage: 'https://developers.google.com/maps/documentation/solar/building-insights',
  } satisfies ProviderDescriptor),
} as const);
