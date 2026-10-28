/** One field of parsed JSON, without trusting its shape: undefined when `value` is not an object or lacks the key. */
export function jsonField(value: unknown, key: string): unknown {
  return value instanceof Object ? Object.getOwnPropertyDescriptor(value, key)?.value : undefined;
}
