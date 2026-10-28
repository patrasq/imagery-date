import { ProviderFailureError } from '../../application/errors/provider-failure.error.ts';
import { FailureCode } from '../../domain/outcome/failure-code.enum.ts';
import { HTTP } from './http.constants.ts';
import { HTTP_COPY } from './http.copy.ts';

interface Waiter {
  grant: () => void;
}

/**
 * At most `limit` tasks at once per key; the rest wait in arrival order. A waiting task whose signal fires leaves the
 * queue at once. Keys with nothing running or waiting hold no memory.
 */
export class KeyedSemaphore {
  readonly #limit: number;
  readonly #running = new Map<string, number>();
  readonly #queues = new Map<string, Waiter[]>();

  constructor(limit: number) {
    this.#limit = Math.max(1, Math.floor(limit));
  }

  async run<T>(key: string, signal: AbortSignal | null, task: () => Promise<T>): Promise<T> {
    await this.#acquire(key, signal);
    try {
      return await task();
    } finally {
      this.#release(key);
    }
  }

  #acquire(key: string, signal: AbortSignal | null): Promise<void> {
    if (signal?.aborted === true) return Promise.reject(KeyedSemaphore.#aborted());
    const running = this.#running.get(key) ?? 0;
    if (running < this.#limit) {
      this.#running.set(key, running + 1);
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const waiter: Waiter = { grant: resolve };
      const leave = (): void => {
        this.#remove(key, waiter);
        reject(KeyedSemaphore.#aborted());
      };
      waiter.grant = (): void => {
        signal?.removeEventListener(HTTP.abortEvent, leave);
        resolve();
      };
      signal?.addEventListener(HTTP.abortEvent, leave, { once: true });
      const queue = this.#queues.get(key);
      if (queue === undefined) this.#queues.set(key, [waiter]);
      else queue.push(waiter);
    });
  }

  /** Hands the slot straight to the next waiter, or frees it. */
  #release(key: string): void {
    const queue = this.#queues.get(key);
    const next = queue?.shift();
    if (queue?.length === 0) this.#queues.delete(key);
    if (next !== undefined) {
      next.grant();
      return;
    }
    const running = (this.#running.get(key) ?? 1) - 1;
    if (running > 0) this.#running.set(key, running);
    else this.#running.delete(key);
  }

  #remove(key: string, waiter: Waiter): void {
    const kept = (this.#queues.get(key) ?? []).filter((queued) => queued !== waiter);
    if (kept.length > 0) this.#queues.set(key, kept);
    else this.#queues.delete(key);
  }

  static #aborted(): ProviderFailureError {
    return new ProviderFailureError(FailureCode.Aborted, HTTP_COPY.aborted);
  }
}
