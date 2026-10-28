/** How clearly a provider's terms allow reading its capture dates this way (PROVIDERS.md has each provider's terms). */
export const TermsClass = Object.freeze({
  /** Published under an open licence: reuse is allowed with attribution. */
  OpenLicence: 'open-licence',
  /** A documented API called with the caller's own key, under the caller's agreement with the provider. */
  OfficialApiOwnKey: 'official-api-own-key',
  /** A public endpoint the provider serves to everyone, whose terms do not explicitly cover this use. */
  PublicTermsUnclear: 'public-terms-unclear',
} as const);
