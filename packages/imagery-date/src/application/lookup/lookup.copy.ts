import { CredentialKind } from '../../domain/provider/credential-kind.enum.ts';
import type { CredentialKindValue } from '../../domain/provider/credential-kind.type.ts';

const CREDENTIAL_NAMES: Readonly<Record<CredentialKindValue, string>> = Object.freeze({
  [CredentialKind.Google]: 'Google Maps Platform',
});

/** Details of the outcomes the lookup service writes itself. */
export const LOOKUP_COPY = Object.freeze({
  missingCredential: (credential: CredentialKindValue) => `No ${CREDENTIAL_NAMES[credential]} API key given.`,
  unexpected: (message: string) => `Unexpected error: ${message}`,
} as const);
