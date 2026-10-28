import { WEB } from './web.constants.ts';

/**
 * The Google key, kept on this device only when asked to. Storage can be missing or refused (private windows, blocked
 * site data), so every access is guarded and the page works without it.
 */
export class KeyStorage {
  read(): string {
    try {
      return window.localStorage.getItem(WEB.storageKey) ?? '';
    } catch {
      return '';
    }
  }

  write(key: string, remember: boolean): void {
    try {
      if (remember && key !== '') window.localStorage.setItem(WEB.storageKey, key);
      else window.localStorage.removeItem(WEB.storageKey);
    } catch {
      // Storage refused: the key stays in this page only.
    }
  }
}
