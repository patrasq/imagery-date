import type { Capture } from '../../domain/capture/capture.interface.ts';
import type { ProviderDescriptor } from '../../domain/provider/provider-descriptor.interface.ts';
import type { ProviderQuery } from './provider-query.interface.ts';

/**
 * One imagery provider. `lookup` resolves with the dated photos the provider shows at the point (empty when it shows
 * none or dates none) and rejects with a `ProviderFailureError` when the provider does not answer usefully.
 */
export abstract class ImageryDateProvider {
  abstract readonly descriptor: ProviderDescriptor;

  abstract lookup(query: ProviderQuery): Promise<readonly Capture[]>;
}
