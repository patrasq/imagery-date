import type { DatePrecision } from './date-precision.enum.ts';

export type DatePrecisionValue = (typeof DatePrecision)[keyof typeof DatePrecision];
