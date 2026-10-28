import type { ProviderId } from './provider-id.enum.ts';

export type ProviderIdValue = (typeof ProviderId)[keyof typeof ProviderId];
