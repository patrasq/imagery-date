import { WEB_COPY } from './web.copy.ts';

/** The page element with this ID, of this kind. @throws Error when the page lacks it: the HTML and code disagree. */
export function requiredElement<T extends HTMLElement>(id: string, kind: new () => T): T {
  const found = document.getElementById(id);
  if (!(found instanceof kind)) throw new Error(WEB_COPY.missing + id);
  return found;
}
