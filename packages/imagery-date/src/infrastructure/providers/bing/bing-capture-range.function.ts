import { ProviderFailureError } from '../../../application/errors/provider-failure.error.ts';
import { CalendarDay } from '../../../domain/calendar/calendar-day.value-object.ts';
import { CaptureDate } from '../../../domain/capture/capture-date.value-object.ts';
import { FailureCode } from '../../../domain/outcome/failure-code.enum.ts';
import { BING } from './bing.constants.ts';
import { BING_COPY } from './bing.copy.ts';

const usDay = (text: string): CalendarDay | null => {
  const match = BING.usDate.exec(text.trim());
  return match === null ? null : CalendarDay.create(Number(match[3]), Number(match[1]), Number(match[2]));
};

/**
 * Bing's `X-VE-TILEMETA-CaptureDatesRange` (`6/16/2021-10/8/2021`) as a range: the tile mixes photos taken between
 * those days, so no single day is claimed. @throws ProviderFailureError when the header is not two such days.
 */
export function bingCaptureRange(header: string): CaptureDate {
  const [first, last, ...rest] = header.split(BING.rangeSeparator);
  try {
    const start = first === undefined ? null : usDay(first);
    const end = last === undefined ? null : usDay(last);
    if (start === null || end === null || rest.length > 0) throw new Error(header);
    return CaptureDate.range(start, end);
  } catch {
    throw new ProviderFailureError(FailureCode.InvalidResponse, BING_COPY.unreadableRange(header));
  }
}
