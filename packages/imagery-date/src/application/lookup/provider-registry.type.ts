import type { ProviderIdValue } from '../../domain/provider/provider-id.type.ts';
import type { ImageryDateProvider } from '../ports/imagery-date-provider.port.ts';

/** The providers a client can ask, in the order their outcomes are reported. */
export type ProviderRegistry = ReadonlyMap<ProviderIdValue, ImageryDateProvider>;
