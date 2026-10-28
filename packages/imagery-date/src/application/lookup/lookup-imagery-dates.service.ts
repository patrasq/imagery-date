import type { ImageryDateReport } from '../../domain/outcome/imagery-date-report.interface.ts';
import { newestCapture } from '../../domain/outcome/newest-capture.function.ts';
import type { Clock } from '../ports/clock.port.ts';
import type { LookupRequest } from './lookup-request.interface.ts';
import type { ProviderRegistry } from './provider-registry.type.ts';
import { selectProviders } from './select-providers.function.ts';
import { settleProvider } from './settle-provider.function.ts';

/** Asks the chosen providers about a point, all at once, and reports every answer. */
export class LookupImageryDates {
  readonly #registry: ProviderRegistry;
  readonly #clock: Clock;

  constructor(registry: ProviderRegistry, clock: Clock) {
    this.#registry = registry;
    this.#clock = clock;
  }

  /** Never rejects because of a provider: each provider's failure is its own outcome. */
  async lookup(request: LookupRequest): Promise<ImageryDateReport> {
    const observedAt = this.#clock.now().iso;
    const { point, zoom, credentials, signal } = request;
    const plans = selectProviders(this.#registry, request.providers, credentials);
    const outcomes = await Promise.all(plans.map((plan) => settleProvider(plan, { point, zoom, credentials, signal })));
    return { point, zoom, observedAt, outcomes, newest: newestCapture(outcomes, zoom) };
  }
}
