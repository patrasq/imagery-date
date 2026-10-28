import type { Capture } from '../../domain/capture/capture.interface.ts';
import type { ProviderDescriptor } from '../../domain/provider/provider-descriptor.interface.ts';
import { ProviderId } from '../../domain/provider/provider-id.enum.ts';
import type { ProviderIdValue } from '../../domain/provider/provider-id.type.ts';
import { TermsClass } from '../../domain/provider/terms-class.enum.ts';
import { ImageryDateProvider } from '../ports/imagery-date-provider.port.ts';
import type { ProviderQuery } from '../ports/provider-query.interface.ts';

type Behaviour = (query: ProviderQuery) => Promise<readonly Capture[]>;

/** A provider for tests: its descriptor is given, its answer is `behaviour`, and every query it gets is kept. */
export class StubProvider extends ImageryDateProvider {
  override readonly descriptor: ProviderDescriptor;
  readonly queries: ProviderQuery[] = [];
  readonly #behaviour: Behaviour;

  constructor(id: ProviderIdValue, behaviour: Behaviour, overrides: Partial<ProviderDescriptor> = {}) {
    super();
    this.descriptor = {
      id,
      name: id,
      terms: TermsClass.OpenLicence,
      credential: null,
      billable: false,
      enabledByDefault: true,
      coverage: null,
      attribution: 'stub',
      homepage: 'https://example.org',
      ...overrides,
    };
    this.#behaviour = behaviour;
  }

  override lookup(query: ProviderQuery): Promise<readonly Capture[]> {
    this.queries.push(query);
    return this.#behaviour(query);
  }

  static answering(id: ProviderIdValue = ProviderId.IgnFrance, captures: readonly Capture[] = []): StubProvider {
    return new StubProvider(id, () => Promise.resolve(captures));
  }
}
