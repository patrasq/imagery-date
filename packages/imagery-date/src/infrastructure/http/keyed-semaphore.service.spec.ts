import { describe, expect, it } from 'vitest';
import { FailureCode } from '../../domain/outcome/failure-code.enum.ts';
import { KeyedSemaphore } from './keyed-semaphore.service.ts';

const flush = async (): Promise<void> => {
  for (let turn = 0; turn < 5; turn += 1) await Promise.resolve();
};

describe(KeyedSemaphore.name, () => {
  it('runs at most the limit per key, others in arrival order, keys independently', async () => {
    const semaphore = new KeyedSemaphore(2);
    const started: string[] = [];
    const releases: (() => void)[] = [];
    const task = (name: string) => () =>
      new Promise<string>((resolve) => {
        started.push(name);
        releases.push(() => {
          resolve(name);
        });
      });
    const runs = ['a1', 'a2', 'a3', 'a4'].map((name) => semaphore.run('a', null, task(name)));
    const other = semaphore.run('b', null, task('b1'));
    await flush();
    expect(started).toEqual(['a1', 'a2', 'b1']);
    releases.shift()?.();
    await flush();
    expect(started).toEqual(['a1', 'a2', 'b1', 'a3']);
    for (const release of releases.splice(0)) release();
    await flush();
    for (const release of releases.splice(0)) release();
    expect(await Promise.all([...runs, other])).toEqual(['a1', 'a2', 'a3', 'a4', 'b1']);
  });
});

describe(`${KeyedSemaphore.name}: failures and cancellation`, () => {
  it('frees a slot when a task fails, and lets a cancelled waiter leave the queue', async () => {
    const semaphore = new KeyedSemaphore(1);
    let release: () => void = () => undefined;
    const holding = semaphore.run('a', null, () => new Promise<void>((resolve) => (release = resolve)));
    const controller = new AbortController();
    const cancelled = semaphore.run('a', controller.signal, () => Promise.resolve('never'));
    const next = semaphore.run('a', null, () => Promise.resolve('next'));
    controller.abort();
    await expect(cancelled).rejects.toMatchObject({ failure: { code: FailureCode.Aborted } });
    release();
    await holding;
    expect(await next).toBe('next');
    await expect(semaphore.run('a', null, () => Promise.reject(new Error('task failed')))).rejects.toThrow(
      'task failed',
    );
    expect(await semaphore.run('a', null, () => Promise.resolve('after'))).toBe('after');
    await expect(semaphore.run('a', controller.signal, () => Promise.resolve('x'))).rejects.toMatchObject({
      failure: { code: FailureCode.Aborted },
    });
  });
});
