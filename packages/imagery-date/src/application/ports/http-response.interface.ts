export interface HttpResponse {
  readonly status: number;
  /** Header names in lower case. */
  readonly headers: ReadonlyMap<string, string>;
  /** The body as text; empty for HEAD requests. */
  readonly body: string;
}
