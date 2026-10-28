export const HISTORY_COPY = Object.freeze({
  summary: (count: number) =>
    count === 0
      ? 'Esri World Imagery Wayback dates no photo here.'
      : `Esri World Imagery has shown ${String(count)} different photo${count === 1 ? '' : 's'} here since February 2014:`,
  columns: Object.freeze(['Taken', 'Product', 'Pixel', 'First published']),
} as const);
