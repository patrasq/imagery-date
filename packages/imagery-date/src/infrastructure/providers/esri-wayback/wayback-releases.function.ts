import type * as z from 'zod/mini';
import { ProviderFailureError } from '../../../application/errors/provider-failure.error.ts';
import { CalendarDay } from '../../../domain/calendar/calendar-day.value-object.ts';
import { FailureCode } from '../../../domain/outcome/failure-code.enum.ts';
import { ESRI_WAYBACK } from './esri-wayback.constants.ts';
import type { waybackConfigSchema } from './wayback-config.schema.ts';
import type { WaybackRelease } from './wayback-release.interface.ts';
import { WAYBACK_COPY } from './wayback.copy.ts';

const publishedOn = (title: string): CalendarDay => {
  const day = ESRI_WAYBACK.titleDay.exec(title)?.[1];
  if (day === undefined)
    throw new ProviderFailureError(FailureCode.InvalidResponse, WAYBACK_COPY.undatedRelease(title));
  return CalendarDay.fromIsoString(day);
};

/** Every release in the configuration, oldest first. */
export function waybackReleases(config: z.infer<typeof waybackConfigSchema>): WaybackRelease[] {
  return Object.entries(config)
    .map(([number, release]) => ({
      number: Number(number),
      publishedOn: publishedOn(release.itemTitle),
      metadataLayerUrl: release.metadataLayerUrl,
    }))
    .sort((a, b) => a.publishedOn.compare(b.publishedOn) || a.number - b.number);
}
