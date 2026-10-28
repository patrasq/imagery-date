import { CredentialKind } from '../../domain/provider/credential-kind.enum.ts';
import type { CredentialKindValue } from '../../domain/provider/credential-kind.type.ts';

const CREDENTIAL_NAMES: Readonly<Record<CredentialKindValue, string>> = Object.freeze({
  [CredentialKind.Google]: 'Google Maps Platform',
});

/** Details of the outcomes the lookup service writes itself. */
export const LOOKUP_COPY = Object.freeze({
  missingCredential: (providerName: string, credential: CredentialKindValue) =>
    `${providerName} needs a ${CREDENTIAL_NAMES[credential]} API key; none was given, so it was not called.`,
  unexpected: (message: string) => `Unexpected error: ${message}`,
} as const);
