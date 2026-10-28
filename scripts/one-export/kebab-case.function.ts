import { ONE_EXPORT_MESSAGES as M } from './one-export-messages.constants.ts';

const SCREAMING_SNAKE = /^[A-Z][A-Z0-9_]*$/;
const ACRONYM_BOUNDARY = /([A-Z]+)([A-Z][a-z])/g;
const WORD_BOUNDARY = /([a-z0-9])([A-Z])/g;

/** HoldRoomHandler → hold-room-handler; BOOKING_RULES → booking-rules; bookingsTable → bookings-table. */
export function kebabCase(name: string): string {
  if (SCREAMING_SNAKE.test(name)) return name.toLowerCase().replaceAll(M.underscore, M.wordSeparator);
  return name.replace(ACRONYM_BOUNDARY, M.kebabReplacement).replace(WORD_BOUNDARY, M.kebabReplacement).toLowerCase();
}
