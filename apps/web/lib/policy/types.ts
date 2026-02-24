import type { Severity } from "../domain/types";

export type PolicyRule = {
  id: string;
  severity: Severity;
  description: string;
  patterns: string[];
  message: string;
  requiredDisclosures?: string[];
};

export type PolicyPack = {
  policyVersion: string;
  rules: PolicyRule[];
};
