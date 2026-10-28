import { RECORDING } from './recording.constants.ts';

/** The recorder's environment: a Google Maps Platform key for the two Google providers (never written anywhere). */
export const RECORDING_CONFIG = Object.freeze({
  googleKey: process.env[RECORDING.environment.googleKey] ?? null,
  only: process.env[RECORDING.environment.only] ?? null,
});
