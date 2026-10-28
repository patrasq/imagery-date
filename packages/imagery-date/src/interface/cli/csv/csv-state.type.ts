import type { CsvState } from './csv-state.enum.ts';

export type CsvStateValue = (typeof CsvState)[keyof typeof CsvState];
