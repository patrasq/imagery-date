type Settled<R> = { readonly ok: true; readonly value: R } | { readonly ok: false; readonly error: unknown };

const settle = <R>(work: Promise<R>): Promise<Settled<R>> =>
  work.then(
    (value) => ({ ok: true, value }),
    (error: unknown) => ({ ok: false, error }),
  );

async function* drain<R>(window: Promise<Settled<R>>[], keep: number): AsyncGenerator<R> {
  while (window.length > keep) {
    const next = await window.shift();
    if (next === undefined) return;
    if (!next.ok) throw next.error;
    yield next.value;
  }
}

/**
 * Runs `task` over `source` with at most `concurrency` tasks in flight and yields the results in input order. Memory
 * stays bounded by `concurrency`, whatever the input size, and the source is read only as fast as results are taken.
 * A task that rejects rethrows at its own position, after every earlier result.
 */
export async function* mapOrdered<T, R>(
  source: AsyncIterable<T> | Iterable<T>,
  concurrency: number,
  task: (item: T) => Promise<R>,
): AsyncGenerator<R> {
  const limit = Math.max(1, Math.floor(concurrency));
  const window: Promise<Settled<R>>[] = [];
  for await (const item of source) {
    window.push(settle(task(item)));
    yield* drain(window, limit - 1);
  }
  yield* drain(window, 0);
}
