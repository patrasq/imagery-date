import { describe, expect, it } from 'vitest';
import { mapOrdered } from './map-ordered.function.ts';

interface Deferred {
  readonly promise: Promise<number>;
  resolve(value: number): void;
  reject(error: Error): void;
}
const deferred = (): Deferred => {
  let resolve: (value: number) => void = () => undefined;
  let reject: (error: Error) => void = () => undefined;
  const promise = new Promise<number>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
const collect = async <T>(source: AsyncGenerator<T>): Promise<T[]> => {
  const results: T[] = [];
  for await (const item of source) results.push(item);
  return results;
};

describe(mapOrdered.name, () => {
  it('yields in input order even when later tasks finish first', async () => {
    const tasks = [deferred(), deferred(), deferred()];
    const running = collect(mapOrdered([0, 1, 2], 3, (index) => tasks[index]?.promise ?? Promise.resolve(-1)));
    tasks[2]?.resolve(30);
    tasks[1]?.resolve(20);
    tasks[0]?.resolve(10);
    expect(await running).toEqual([10, 20, 30]);
  });

  it('never runs more than the concurrency at once and reads the source lazily', async () => {
    let inFlight = 0;
    let peak = 0;
    let read = 0;
    function* source(): Generator<number> {
      for (let index = 0; index < 20; index += 1) {
        read += 1;
        yield index;
      }
    }
    const generator = mapOrdered(source(), 4, async (index) => {
      inFlight += 1;
      peak = Math.max(peak, inFlight);
      await Promise.resolve();
      inFlight -= 1;
      return index * 2;
    });
    const first = await generator.next();
    expect(first.value).toBe(0);
    expect(read).toBe(4);
    const rest = await collect(generator);
    expect(rest).toHaveLength(19);
    expect(peak).toBeLessThanOrEqual(4);
  });
});

describe(`${mapOrdered.name}: failures and edges`, () => {
  it('rethrows a failed task at its position, after the earlier results', async () => {
    const results: number[] = [];
    const failing = mapOrdered([1, 2, 3], 2, (value) =>
      value === 2 ? Promise.reject(new Error('second failed')) : Promise.resolve(value),
    );
    await expect(
      (async () => {
        for await (const value of failing) results.push(value);
      })(),
    ).rejects.toThrow('second failed');
    expect(results).toEqual([1]);
  });

  it('treats a concurrency below one as one, and handles an empty source', async () => {
    expect(await collect(mapOrdered([5, 6], 0, (value) => Promise.resolve(value)))).toEqual([5, 6]);
    expect(await collect(mapOrdered([], 3, (value: number) => Promise.resolve(value)))).toEqual([]);
  });
});
