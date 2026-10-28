import type { OutcomeStatus } from './outcome-status.enum.ts';

export type OutcomeStatusValue = (typeof OutcomeStatus)[keyof typeof OutcomeStatus];
