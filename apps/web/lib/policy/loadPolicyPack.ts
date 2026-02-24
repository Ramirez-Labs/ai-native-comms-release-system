import type { PolicyPack } from "./types";

import pack from "./policy.generic.v0.1.json";

export function loadGenericPolicyPackV01(): PolicyPack {
  // JSON import is validated in tests; keep runtime simple.
  return pack as PolicyPack;
}
