/** The keys a caller may supply. Only providers whose terms require a key ask for one. */
export const CredentialKind = Object.freeze({
  /** A Google Maps Platform API key. */
  Google: 'google',
} as const);
