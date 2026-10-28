import type { CredentialKindValue } from './credential-kind.type.ts';

/** The caller's keys by kind. A provider whose key is missing is skipped, never called. */
export type Credentials = Readonly<Partial<Record<CredentialKindValue, string>>>;
