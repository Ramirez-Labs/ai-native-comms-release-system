import { describe, expect, it } from "vitest";
import { fixtureDrafts } from "../fixtures/drafts";
import { loadGenericPolicyPackV01 } from "./loadPolicyPack";
import { evaluateDeterministicRules } from "./ruleEngine";

describe("deterministic rule engine", () => {
  const policy = loadGenericPolicyPackV01();

  it("returns low severity for benign copy", () => {
    const res = evaluateDeterministicRules(fixtureDrafts.autoPass, policy);
    expect(res.severity).toBe("low");
    expect(res.violations).toHaveLength(0);
  });

  it("flags needsChanges fixture with superlatives + risk-free language", () => {
    const res = evaluateDeterministicRules(fixtureDrafts.needsChanges, policy);
    expect(res.firedRuleIds).toEqual(expect.arrayContaining(["R-SUPERLATIVE-BEST", "R-RISK-NO-RISK"]));
    expect(res.severity).toBe("high");
    expect(res.violations.some((v) => v.citation.start >= 0)).toBe(true);
  });

  it("flags escalate fixture with guaranteed returns + fee absolutes", () => {
    const res = evaluateDeterministicRules(fixtureDrafts.escalate, policy);
    expect(res.firedRuleIds).toEqual(
      expect.arrayContaining(["R-RETURNS-GUARANTEE", "R-PERCENT-RETURN", "R-FEES-ABSOLUTE"])
    );
    expect(res.severity).toBe("high");
    expect(res.requiredDisclosures).toEqual(
      expect.arrayContaining([
        "Past performance is not indicative of future results",
        "Fee schedule and applicable conditions",
      ])
    );
  });
});
