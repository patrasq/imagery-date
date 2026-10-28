import { describe, expect, it } from 'vitest';
import { exportedNames } from './exported-names.function.ts';

const names = (source: string): string[] => exportedNames('x.ts', source);

describe(exportedNames.name, () => {
  it('finds exported declarations of every kind', () => {
    expect(names('export class A {}')).toEqual(['A']);
    expect(names('export abstract class A {}')).toEqual(['A']);
    expect(names('export function f() {}')).toEqual(['f']);
    expect(names('export interface I {}')).toEqual(['I']);
    expect(names('export type T = string;')).toEqual(['T']);
    expect(names('export const a = 1, b = 2;')).toEqual(['a', 'b']);
    expect(names('export enum E { A }')).toEqual(['E']);
  });

  it('finds export lists, star exports and default exports', () => {
    expect(names('const a = 1; const b = 2; export { a, b as c };')).toEqual(['a', 'c']);
    expect(names("export * from './x.ts';")).toEqual(['*']);
    expect(names("export * as ns from './x.ts';")).toEqual(['ns']);
    expect(names('export default class {}')).toEqual(['default']);
    expect(names('const a = 1; export default a;')).toEqual(['default']);
  });

  it('counts a type and a value of the same name once', () => {
    expect(names('export type UserId = string; export const UserId = {};')).toEqual(['UserId']);
  });

  it('ignores what is not exported', () => {
    expect(names("import { a } from './a.ts'; class B {} const c = a;")).toEqual([]);
  });
});
