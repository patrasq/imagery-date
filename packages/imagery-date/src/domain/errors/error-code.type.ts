import type { ErrorCode } from './error-code.enum.ts';

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];
