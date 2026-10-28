import { FailureCode } from '../../../domain/outcome/failure-code.enum.ts';
import type { FailureCodeValue } from '../../../domain/outcome/failure-code.type.ts';
import { StreetViewStatus } from './street-view-status.enum.ts';

/** What each Street View status means: null for "read the panorama" and "no panorama", otherwise the failure. */
export const STREET_VIEW_STATUS_OUTCOMES: Readonly<Record<string, FailureCodeValue | null>> = Object.freeze({
  [StreetViewStatus.Ok]: null,
  [StreetViewStatus.ZeroResults]: null,
  [StreetViewStatus.NotFound]: null,
  [StreetViewStatus.RequestDenied]: FailureCode.Refused,
  [StreetViewStatus.OverQueryLimit]: FailureCode.Refused,
  [StreetViewStatus.InvalidRequest]: FailureCode.InvalidResponse,
  [StreetViewStatus.UnknownError]: FailureCode.HttpStatus,
});
