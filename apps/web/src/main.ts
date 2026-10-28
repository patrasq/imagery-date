// The page: a map whose clicks run lookups into the side panel. Shareable as #latitude,longitude,zoom.
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles.css';
import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { KeyStorage } from './key-storage.service.ts';
import { LookupController } from './lookup-controller.service.ts';
import type { LookupSettings } from './lookup-settings.interface.ts';
import { pointHash } from './point-hash.function.ts';
import { requiredElement } from './required-element.function.ts';
import { WEB } from './web.constants.ts';

const ids = WEB.ids;
const zoom = requiredElement(ids.zoom, HTMLSelectElement);
const googleKey = requiredElement(ids.googleKey, HTMLInputElement);
const rememberKey = requiredElement(ids.rememberKey, HTMLInputElement);
const solar = requiredElement(ids.solar, HTMLInputElement);
const historyButton = requiredElement(ids.history, HTMLButtonElement);
const storage = new KeyStorage();
// MapLibre 6 ships its worker as a separate, self-contained module: Vite serves it as an asset.
setWorkerUrl(mapWorkerUrl);
const controller = new LookupController(requiredElement(ids.results, HTMLElement));
const map = new MapLibreMap({
  container: ids.map,
  style: window.matchMedia(WEB.darkScheme).matches ? WEB.mapStyles.dark : WEB.mapStyles.light,
  center: [WEB.start.longitude, WEB.start.latitude],
  zoom: WEB.start.zoom,
});
const marker = new Marker({ color: WEB.markerColour });
let point: { latitude: number; longitude: number } | null = null;

googleKey.value = storage.read();
rememberKey.checked = googleKey.value !== '';
map.addControl(new NavigationControl(), WEB.controlPosition);

const settings = (): LookupSettings => ({
  zoom: Number(zoom.value),
  googleKey: googleKey.value.trim(),
  solar: solar.checked,
});
const select = (latitude: number, longitude: number): void => {
  point = { latitude, longitude };
  marker.setLngLat([longitude, latitude]).addTo(map);
  historyButton.disabled = false;
  window.history.replaceState(
    null,
    '',
    WEB.hashPrefix +
      [latitude.toFixed(WEB.coordinateDecimals), longitude.toFixed(WEB.coordinateDecimals), zoom.value].join(
        WEB.hashSeparator,
      ),
  );
  void controller.lookup(latitude, longitude, settings());
};
const keepKey = (): void => {
  storage.write(googleKey.value.trim(), rememberKey.checked);
};

map.on(WEB.events.click, (event) => {
  select(event.lngLat.lat, event.lngLat.lng);
});
historyButton.addEventListener(WEB.events.click, () => {
  if (point !== null) void controller.history(point.latitude, point.longitude, settings());
});
googleKey.addEventListener(WEB.events.change, keepKey);
rememberKey.addEventListener(WEB.events.change, keepKey);

const shared = pointHash(window.location.hash);
if (shared !== null) {
  zoom.value = String(shared.zoom);
  map.jumpTo({ center: [shared.longitude, shared.latitude], zoom: WEB.pointZoom });
  select(shared.latitude, shared.longitude);
}
