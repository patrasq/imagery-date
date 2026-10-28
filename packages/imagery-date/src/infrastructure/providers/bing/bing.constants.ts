import { ProviderId } from '../../../domain/provider/provider-id.enum.ts';
import type { ProviderDescriptor } from '../../../domain/provider/provider-descriptor.interface.ts';
import { TermsClass } from '../../../domain/provider/terms-class.enum.ts';

export const BING = Object.freeze({
  /** `…/tiles/a<quadkey>.jpeg?g=<generation>`: the aerial tile, asked for with HEAD so no image is downloaded. */
  tileUrlStart: 'https://ecn.t0.tiles.virtualearth.net/tiles/a',
  tileUrlEnd: '.jpeg',
  generationParameter: 'g',
  /** The tile service refuses requests without a generation and accepts any current one (DECISIONS.md D-008). */
  generation: '15000',
  /** Bing's aerial layer is complete to zoom 19; deeper tiles exist only in some cities. */
  maximumZoom: 19,
  /** `6/16/2021-10/8/2021`: the first and last capture day of the photos in the tile, month/day/year. */
  captureRangeHeader: 'x-ve-tilemeta-capturedatesrange',
  rangeSeparator: '-',
  usDate: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
  noTileStatuses: new Set([204, 404]),
  descriptor: Object.freeze({
    id: ProviderId.Bing,
    name: 'Bing Maps Aerial',
    terms: TermsClass.PublicTermsUnclear,
    credential: null,
    billable: false,
    enabledByDefault: true,
    coverage: null,
    attribution: '© Microsoft',
    homepage: 'https://www.bing.com/maps?style=a',
  } satisfies ProviderDescriptor),
} as const);
