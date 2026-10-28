import type { ImageryDateReport, ProviderDescriptor } from 'imagery-date';
import { element } from './element.function.ts';
import { renderOutcome } from './render-outcome.function.ts';
import { WEB } from './web.constants.ts';
import { WEB_COPY } from './web.copy.ts';

const C = WEB.classes;
const T = WEB.tags;
const fixed = (value: number): string => value.toFixed(WEB.coordinateDecimals);

const renderNewest = (report: ImageryDateReport, nameOf: (id: string) => string): HTMLElement => {
  const box = element(T.div, C.newest);
  const where = WEB_COPY.where(fixed(report.point.latitude), fixed(report.point.longitude), report.zoom.value);
  box.append(element(T.p, C.muted, where));
  if (report.newest === null) {
    box.append(element(T.p, null, WEB_COPY.noNewest));
    return box;
  }
  box.append(element(T.h2, null, WEB_COPY.newest), element(T.p, C.newestDate, report.newest.date.value));
  box.append(element(T.p, C.muted, nameOf(report.newest.provider)));
  return box;
};

/** A report: the newest photo shown at the zoom, then one card per provider asked, in report order. */
export function renderReport(report: ImageryDateReport, providers: readonly ProviderDescriptor[]): HTMLElement[] {
  const names = new Map<string, string>(providers.map((provider) => [provider.id, provider.name]));
  const nameOf = (id: string): string => names.get(id) ?? id;
  return [
    renderNewest(report, nameOf),
    ...report.outcomes.map((outcome) => renderOutcome(outcome, nameOf(outcome.provider))),
  ];
}
