import type { ProviderDescriptor } from '../../domain/provider/provider-descriptor.interface.ts';
import { CLI } from './cli.constants.ts';
import { CLI_COPY } from './cli.copy.ts';
import { formatTable } from './format-table.function.ts';

const yesNo = (value: boolean): string => (value ? CLI_COPY.yes : CLI_COPY.no);

/** Every provider: its ID, name, terms class, the key it needs, whether it runs by default, whether it bills. */
export function renderProviders(providers: readonly ProviderDescriptor[]): string {
  const rows = providers.map((provider) => [
    provider.id,
    provider.name,
    provider.terms,
    provider.credential ?? CLI.empty,
    yesNo(provider.enabledByDefault && !provider.billable),
    yesNo(provider.billable),
  ]);
  return formatTable(CLI_COPY.providerColumns, rows);
}
