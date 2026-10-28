import type { Capture } from '../capture/capture.interface.ts';
import type { ProviderIdValue } from '../provider/provider-id.type.ts';
import type { OutcomeStatusValue } from './outcome-status.type.ts';
import type { ProviderFailure } from './provider-failure.interface.ts';

/** One provider's answer for one point. `captures` is empty unless the status is `found` or `partial`. */
export interface ProviderOutcome {
  readonly provider: ProviderIdValue;
  readonly status: OutcomeStatusValue;
  readonly captures: readonly Capture[];
  /** Why it was skipped or failed, or what a partial answer lacks; null otherwise. */
  readonly failure: ProviderFailure | null;
}
