import { IncompleteAnswerError } from '../../../application/errors/incomplete-answer.error.ts';
import { ProviderFailureError } from '../../../application/errors/provider-failure.error.ts';
import type { Capture } from '../../../domain/capture/capture.interface.ts';
import { FailureCode } from '../../../domain/outcome/failure-code.enum.ts';
import { earliestPublications } from './earliest-publications.function.ts';
import { ESRI_WAYBACK } from './esri-wayback.constants.ts';
import { WAYBACK_COPY } from './wayback.copy.ts';

const asFailure = (reason: unknown): ProviderFailureError =>
  reason instanceof ProviderFailureError
    ? reason
    : new ProviderFailureError(FailureCode.Unexpected, reason instanceof Error ? reason.message : String(reason));

/**
 * The photos of every release that answered. When some releases did not answer, the photos found so far are kept and
 * the answer is marked incomplete; when none answered, the first failure is the answer.
 * @throws IncompleteAnswerError or ProviderFailureError when any release did not answer.
 */
export function settledCaptures(results: readonly PromiseSettledResult<Capture[]>[]): Capture[] {
  const captures = earliestPublications(
    results.flatMap((result) => (result.status === ESRI_WAYBACK.fulfilled ? result.value : [])),
  );
  const failures = results.flatMap((result) =>
    result.status === ESRI_WAYBACK.rejected ? [asFailure(result.reason)] : [],
  );
  const first = failures[0];
  if (first === undefined) return captures;
  const detail = WAYBACK_COPY.missingReleases(failures.length, results.length, first.failure.detail);
  throw new IncompleteAnswerError(captures, first.failure.code, detail);
}
