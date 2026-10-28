# Providers

Source, precision, coverage and terms of each provider. All were tested against the live services on 2026-10-28 at the
locations in `packages/imagery-date/scripts/recording.constants.ts`; the responses are stored in
`packages/imagery-date/test/recordings` and replayed by the tests.

Terms classes (this project's classification, not legal advice):

- `open-licence`: published under an open licence; reuse allowed with attribution.
- `official-api-own-key`: documented API, called with the user's own key under the user's agreement with the provider.
- `public-terms-unclear`: public endpoint whose terms do not explicitly cover this use.

## ign-france (IGN France BD ORTHO)

- **Date**: flight day (`date_vol`), campaign year (`pva`), pixel size (`res`, 20 cm).
- **Source**: Géoplateforme WFS, layer `ORTHOIMAGERY.ORTHOPHOTOS.GRAPHE-MOSAIQUAGE:graphe_bdortho`, box of about 1 m
  around the point, `PROPERTYNAME=date_vol,res,pva` (response size 1.7 KB instead of 2.2 MB with geometry).
- **Coverage**: metropolitan France and Corsica, Guadeloupe, Martinique, Guyane, La Réunion, Mayotte. Points inside the
  bounding boxes but outside France return `no-date`.
- **Terms**: `open-licence` (Licence Ouverte 2.0). Attribution: "IGN – BD ORTHO®".
- **Tested**: Notre-Dame de Paris → 2024-08-27, BD ORTHO 2024, 0.2 m.

## swisstopo (SWISSIMAGE 10 cm)

- **Date**: flight year (`datenstand`) per map sheet; swisstopo does not publish the day. Pixel size.
- **Source**: geo.admin.ch `identify`, layer `ch.swisstopo.images-swissimage-dop10.metadata`.
- **Coverage**: Switzerland and Liechtenstein.
- **Terms**: `open-licence` (swisstopo open government data). Attribution: "© swisstopo".
- **Tested**: Zürich main station → 2025, 0.1 m.

## esri-world-imagery (Esri World Imagery)

- **Date**: capture day (`SRC_DATE`) of each image in the basemap at the point, with its zoom range, pixel size and
  source name. Different zoom ranges can show different images.
- **Source**: `World_Imagery/MapServer/4/query` (Citations layer), one request per point. The undated 15 m global
  mosaic is skipped.
- **Terms**: `public-terms-unclear`. Esri grants use of this metadata for OpenStreetMap editing; other uses fall under
  Esri's terms of use. Attribution: "Esri, Vantor, Earthstar Geographics, and the GIS User Community".
- **Tested**: Copenhagen City Hall → 2025-03-21 (zoom 12–19, 0.5 m) and 2012-01-15 (zoom 20, 0.1 m); open Atlantic →
  `no-date`.

## bing (Bing Maps Aerial)

- **Date**: first and last capture day of the images in the zoom-19 tile, returned as a date range.
- **Source**: `X-VE-TILEMETA-CaptureDatesRange` response header of the tile, requested with `HEAD`. The header is listed
  in `Access-Control-Expose-Headers`, so it is readable from browsers.
- **Terms**: `public-terms-unclear`. Bing Maps for Enterprise is being retired (free keys ended 2025-06-30, enterprise
  accounts end 2028-06-30). Attribution: "© Microsoft".
- **Tested**: Notre-Dame de Paris → 2021-06-16/2021-10-08.

## esri-wayback (Esri World Imagery Wayback)

- **Date**: every image World Imagery has shown at the point since February 2014, newest first, with capture day and
  the date of the first release that included it. Not queried by default.
- **Source**: the Wayback release list; each release's tilemap gives the release that last changed the tile, so only
  releases with changes are queried; each is dated from its metadata service.
- **Latency**: archived metadata services took 25–61 s and returned one 502 (2026-10-28). Timeout is 90 s with retries;
  if some releases still fail, the outcome is `partial` and lists what is missing.
- **Terms**: as `esri-world-imagery`.
- **Tested**: Copenhagen City Hall, zoom 18 → 9 images from 2012-01-15 to 2025-03-21, 23 requests.

## google-street-view (Google Street View)

- **Date**: month or year of the nearest outdoor panorama within 50 m; distance and attribution. Street-level, not
  aerial.
- **Source**: Street View Static API image metadata (no charge and no quota use, per Google's documentation).
- **Contributed panoramas**: the nearest panorama is often a user-uploaded photo sphere (all four Paris landmarks
  tested returned one). Panoramas not attributed exactly `© Google` or `© <year> Google` are labelled "Street View
  photo by a contributor". The year in `© <year> Google` is a copyright year.
- **Terms**: `official-api-own-key`.
- **Tested**: Paris 14e street → 2025-07 (Google); Paris 15e → 2024-12 (contributor).

## google-solar (Google Solar API)

- **Date**: capture day of the aerial image used for the building nearest the point; imagery quality; distance to the
  building centre.
- **Source**: `buildingInsights:findClosest` with `fields=imageryDate,imageryQuality,center`.
- **Billing**: billed by Google beyond its free tier; queried only when listed in `providers`.
- **Terms**: `official-api-own-key`.
- **Tested**: Palace of the Parliament, Bucharest → 2021-07-28, quality HIGH, 4 m.

## Not supported

- **Google Earth historical imagery**: dates are only available through an undocumented internal format not permitted
  by Google's terms.
- **Google Maps satellite tiles**: no capture date is published, and direct tile access is not permitted.
- **Apple Maps**: no known source of capture dates.
