import type { Id } from "./types";

/**
 * Generates a human-friendly ID suitable for demos.
 * Not cryptographically secure.
 */
export function newId(prefix: string): Id {
  const rand = Math.random().toString(16).slice(2, 10);
  return `${prefix}_${rand}`;
}
