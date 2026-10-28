import type { ProviderFailure } from '../../domain/outcome/provider-failure.interface.ts';
import type { ImageryDateProvider } from '../ports/imagery-date-provider.port.ts';

/** A provider chosen for a lookup, and why it will not be called (null when it will be). */
export interface ProviderPlan {
  readonly provider: ImageryDateProvider;
  readonly skip: ProviderFailure | null;
}
