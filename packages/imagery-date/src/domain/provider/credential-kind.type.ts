import type { CredentialKind } from './credential-kind.enum.ts';

export type CredentialKindValue = (typeof CredentialKind)[keyof typeof CredentialKind];
