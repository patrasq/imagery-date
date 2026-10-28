/** A new element with a class and, optionally, text: the only way the page builds markup, so no HTML is injected. */
export function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string | null,
  text: string | null = null,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className !== null) node.className = className;
  if (text !== null) node.textContent = text;
  return node;
}
