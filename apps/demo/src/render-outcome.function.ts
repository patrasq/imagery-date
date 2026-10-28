import type { Capture, ProviderOutcome } from 'imagery-date';
import { captureFacts } from './capture-facts.function.ts';
import { element } from './element.function.ts';
import { WEB } from './web.constants.ts';
import { WEB_COPY } from './web.copy.ts';

const C = WEB.classes;
const T = WEB.tags;

const renderCapture = (capture: Capture): HTMLElement => {
  const node = element(T.div, C.capture);
  const date = element(T.p, C.date, capture.date.value);
  date.append(element(T.span, C.precision, WEB_COPY.precisions[capture.date.precision]));
  const facts = element(T.dl, C.facts);
  for (const [label, value] of captureFacts(capture))
    facts.append(element(T.dt, null, label), element(T.dd, null, value));
  node.append(date, facts);
  return node;
};

/** One provider's card: its name, what happened, each dated photo, and why it says nothing when it does. */
export function renderOutcome(outcome: ProviderOutcome, name: string): HTMLElement {
  const card = element(T.article, C.card);
  card.setAttribute(WEB.statusAttribute, outcome.status);
  const head = element(T.div, C.cardHead);
  head.append(element(T.h3, null, name), element(T.span, C.status, WEB_COPY.statuses[outcome.status]));
  card.append(head, ...outcome.captures.map(renderCapture));
  if (outcome.failure !== null) card.append(element(T.p, C.note, outcome.failure.detail));
  return card;
}
