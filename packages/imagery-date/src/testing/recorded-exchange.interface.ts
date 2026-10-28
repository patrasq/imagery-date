import type { HttpMethodValue } from '../application/ports/http-method.type.ts';
import type { ProviderFailure } from '../domain/outcome/provider-failure.interface.ts';

/** One request a provider sent and what came back: a response, or a failure to get one. */
export interface RecordedExchange {
  readonly request: { readonly method: HttpMethodValue; readonly url: string };
  readonly response: {
    readonly status: number;
    readonly headers: Readonly<Record<string, string>>;
    readonly body: string;
  } | null;
  /** Set instead of `response` when no answer came (timeout, network failure). */
  readonly failure: ProviderFailure | null;
}
