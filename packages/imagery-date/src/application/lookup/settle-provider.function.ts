import { FailureCode } from '../../domain/outcome/failure-code.enum.ts';
import { OutcomeStatus } from '../../domain/outcome/outcome-status.enum.ts';
import type { ProviderOutcome } from '../../domain/outcome/provider-outcome.interface.ts';
import type { ProviderIdValue } from '../../domain/provider/provider-id.type.ts';
import { IncompleteAnswerError } from '../errors/incomplete-answer.error.ts';
import { ProviderFailureError } from '../errors/provider-failure.error.ts';
import type { ProviderQuery } from '../ports/provider-query.interface.ts';
import { LOOKUP_COPY } from './lookup.copy.ts';
import type { ProviderPlan } from './provider-plan.interface.ts';

const outside = (plan: ProviderPlan, query: ProviderQuery): boolean => {
  const coverage = plan.provider.descriptor.coverage;
  return coverage !== null && !coverage.some((box) => box.contains(query.point));
};

const failedWith = (error: unknown): ProviderFailureError =>
  error instanceof ProviderFailureError
    ? error
    : new ProviderFailureError(
        FailureCode.Unexpected,
        LOOKUP_COPY.unexpected(error instanceof Error ? error.message : String(error)),
      );

const failureOutcome = (provider: ProviderIdValue, error: unknown): ProviderOutcome => {
  const failure = failedWith(error);
  if (failure instanceof IncompleteAnswerError && failure.captures.length > 0) {
    return { provider, status: OutcomeStatus.Partial, captures: failure.captures, failure: failure.failure };
  }
  return { provider, status: OutcomeStatus.Failed, captures: [], failure: failure.failure };
};

/**
 * Asks one provider and turns whatever happens into an outcome. It never rejects: one provider failing degrades the
 * report to the other providers' answers instead of failing the lookup (CONTRIBUTING.md, Failure).
 */
export async function settleProvider(plan: ProviderPlan, query: ProviderQuery): Promise<ProviderOutcome> {
  const provider = plan.provider.descriptor.id;
  if (plan.skip !== null) return { provider, status: OutcomeStatus.Skipped, captures: [], failure: plan.skip };
  if (outside(plan, query)) return { provider, status: OutcomeStatus.OutsideCoverage, captures: [], failure: null };
  try {
    const captures = await plan.provider.lookup(query);
    const status = captures.length > 0 ? OutcomeStatus.Found : OutcomeStatus.NoDate;
    return { provider, status, captures, failure: null };
  } catch (error: unknown) {
    return failureOutcome(provider, error);
  }
}
