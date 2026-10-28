import { describe, expect, it } from 'vitest';
import { pointHash } from './point-hash.function.ts';

describe(pointHash.name, () => {
  it('reads a shared point', () => {
    expect(pointHash('#48.853,2.3499,19')).toEqual({ latitude: 48.853, longitude: 2.3499, zoom: 19 });
  });

  it.each(['', '#', '#48.853,2.3499', '#a,b,c', '#1,2,3,4', '#48.853,,19'])('ignores %j', (hash) => {
    expect(pointHash(hash)).toBeNull();
  });
});
