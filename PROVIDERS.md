# Providers

What each provider states, where `imagery-date` reads it, how exactly, and under what terms. Every provider was
checked against its live service on 2026-10-28 at the landmarks in `packages/imagery-date/scripts/recording.constants.ts`;
the responses are recorded under `packages/imagery-date/test/recordings` and replayed by the tests.

The terms classes are this project's reading, not legal advice:

- **open-licence**: published under an open licence; reuse allowed with the credit given.
- **official-api-own-key**: a documented API, called with your own key, under your agreement with the provider.
- **public-terms-unclear**: a public endpoint the provider serves to everyone (and that OpenStreetMap's editors read),
  whose terms do not explicitly cover this use. Check them before building a product on it.

## ign-france · IGN France BD ORTHO

- **States**: the flight day (`date_vol`) of the orthophoto at the point, its campaign year and its pixel (20 cm).
- **Source**: the BD ORTHO mosaic graph on the Géoplateforme WFS
  (`ORTHOIMAGERY.ORTHOPHOTOS.GRAPHE-MOSAIQUAGE:graphe_bdortho`), queried with a box of about one metre around the point
  and only the three fields read (`PROPERTYNAME`), which cuts each answer from about 2.2 MB of polygons to 1.7 KB.
- **Coverage**: metropolitan France with Corsica, Guadeloupe, Martinique, Guyane, La Réunion and Mayotte. Coarse boxes
  decide whether it is asked; a point in a box but outside France answers `no-date`.
- **Terms**: open-licence (Licence Ouverte 2.0). Credit: "IGN – BD ORTHO®".
- **Checked**: Notre-Dame de Paris → 2024-08-27, BD ORTHO 2024, 0.2 m.

## swisstopo · SWISSIMAGE 10 cm

- **States**: the year of the flight (`datenstand`) per map sheet, and the pixel. swisstopo publishes the year only,
  so the date is a year.
- **Source**: geo.admin.ch `identify` on `ch.swisstopo.images-swissimage-dop10.metadata`.
- **Coverage**: Switzerland and Liechtenstein.
- **Terms**: open-licence (swisstopo open government data). Credit: "© swisstopo".
- **Checked**: Zürich main station → 2025, 0.1 m.

## esri-world-imagery · Esri World Imagery

- **States**: the capture day (`SRC_DATE`) of every photo in the basemap at the point, with the zoom levels that show
  it, its pixel and its source name. The date depends on the zoom: at Copenhagen City Hall the basemap shows a
  2025-03-21 satellite photo at zoom 12–19 and a 2012-01-15 aerial at zoom 20.
- **Source**: the basemap's own Citations layer (`World_Imagery/MapServer/4/query`), one request per point. The
  undated 15 m world mosaic is left out.
- **Terms**: public-terms-unclear. Esri explicitly allows this metadata for OpenStreetMap editing; other uses fall
  under Esri's terms of use. Credit: "Esri, Vantor, Earthstar Geographics, and the GIS User Community".
- **Checked**: Copenhagen City Hall → 2025-03-21 (zoom 12–19, 0.5 m) and 2012-01-15 (zoom 20, 0.1 m); the open
  Atlantic → no date.

## bing · Bing Maps Aerial

- **States**: the first and last capture day of the photos in the aerial tile at the point, as a range: a tile can mix
  photos, so no single day is claimed.
- **Source**: the `X-VE-TILEMETA-CaptureDatesRange` header of the zoom-19 tile, read with `HEAD`, so no photo is
  downloaded. Bing exposes the header to browsers on purpose (`Access-Control-Expose-Headers`).
- **Terms**: public-terms-unclear. Bing Maps for Enterprise is being retired (free keys ended 2025-06-30, enterprise
  ends 2028-06-30), so this source may disappear. Credit: "© Microsoft".
- **Checked**: Notre-Dame de Paris → 2021-06-16/2021-10-08.

## esri-wayback · Esri World Imagery Wayback

- **States**: every photo World Imagery has shown at the point since February 2014, newest first, each with its
  capture day and the first archived release that published it. Not asked by default (about two requests per photo).
- **Source**: the Wayback release list, then each release's tilemap says which earlier release drew the tile, so only
  releases where the tile changed are asked; each of those is dated from its own metadata service.
- **Slow by nature**: archived metadata services answered in 25–61 s, once with a 502 (2026-10-28), so they get a
  90 s timeout and retries. A release that still does not answer leaves a `partial` outcome with the photos found.
- **Terms**: as Esri World Imagery.
- **Checked**: Copenhagen City Hall, zoom 18 → 9 photos from 2012-01-15 to 2025-03-21 in 23 requests.

## google-street-view · Google Street View

- **States**: the month (or only the year) of the nearest outdoor panorama within 50 m, its distance and its credit.
  A street-level photo, not an aerial one.
- **Source**: the Street View Static API image metadata, which Google documents as free and quota-free.
- **Mind the owner**: the nearest panorama is often a photo sphere someone uploaded. All four Paris landmarks tried
  returned one. A panorama not credited to Google (`© Google` or `© <year> Google`, the year being the copyright year,
  not the capture) is named "Street View photo by a contributor", with its owner's credit.
- **Terms**: official-api-own-key (your Google Maps Platform key).
- **Checked**: a street in Paris 14e → 2025-07, Google's own panorama; Paris 15e → 2024-12, a contributor's.

## google-solar · Google Solar API

- **States**: the capture day of the aerial photo the Solar API analysed for the building nearest the point, its
  quality and the distance to that building's centre.
- **Source**: `buildingInsights:findClosest`, asking only for `imageryDate`, `imageryQuality` and `center`.
- **Billed**: Google bills each request beyond its free tier, so it runs only when named in `providers`.
- **Terms**: official-api-own-key.
- **Checked**: the Palace of the Parliament, Bucharest → 2021-07-28, HIGH quality, 4 m from the point.

## Left out, on purpose

- **Google Earth historical imagery**: dated, but read only through an undocumented internal format that Google's
  terms do not allow.
- **Google Maps satellite tiles**: no capture date is published, and fetching the tiles directly breaks the terms.
- **Apple Maps**: no source of capture dates is known.
