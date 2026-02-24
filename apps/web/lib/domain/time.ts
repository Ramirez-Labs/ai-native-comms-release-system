import type { ISODateTime } from "./types";

export function nowIso(): ISODateTime {
  return new Date().toISOString();
}
