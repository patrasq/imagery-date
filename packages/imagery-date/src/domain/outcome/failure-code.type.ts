import type { FailureCode } from './failure-code.enum.ts';

export type FailureCodeValue = (typeof FailureCode)[keyof typeof FailureCode];
