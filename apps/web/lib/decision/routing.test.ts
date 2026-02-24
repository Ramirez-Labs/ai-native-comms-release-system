import { describe, expect, it } from "vitest";
import { fixtureDrafts } from "../fixtures/drafts";
import { loadGenericPolicyPackV01 } from "../policy/loadPolicyPack";
import { evaluateDeterministicRules } from "../policy/ruleEngine";
import { routeFromRuleEngine, toEvaluation } from "./routing";

describe("routing decision engine", () => {
  const policy = loadGenericPolicyPackV01();

  it("routes benign copy to pass", () => {
    const ruleRes = evaluateDeterministicRules(fixtureDrafts.autoPass, policy);
    const routing = routeFromRuleEngine(ruleRes);

    expect(ruleRes.violations).toHaveLength(0);
    expect(routing.decision).toBe("pass");
    expect(routing.severity).toBe("low");
    expect(routing.abstained).toBe(false);
    expect(routing.confidence.score).toBeGreaterThanOrEqual(0.9);
  });

  it("routes medium/high findings to needs_changes or escalate deterministically", () => {
    const ruleRes = evaluateDeterministicRules(fixtureDrafts.needsChanges, policy);
    const routing = routeFromRuleEngine(ruleRes);

    // needsChanges fixture contains "No risk" which is high severity.
    expect(ruleRes.severity).toBe("high");
    expect(routing.decision).toBe("escalate");
    expect(routing.abstained).toBe(false);
  });

  it("routes explicit guaranteed returns to escalate", () => {
    const ruleRes = evaluateDeterministicRules(fixtureDrafts.escalate, policy);
    const routing = routeFromRuleEngine(ruleRes);

    expect(ruleRes.severity).toBe("high");
    expect(routing.decision).toBe("escalate");
  });

  it("produces a complete Evaluation object", () => {
    const ruleRes = evaluateDeterministicRules(fixtureDrafts.escalate, policy);
    const routing = routeFromRuleEngine(ruleRes);

    const evalObj = toEvaluation(ruleRes, "2026-01-01T00:00:00.000Z", routing);

    expect(evalObj.policyVersion).toBe("POLICY_GENERIC_v0.1");
    expect(evalObj.evaluatedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(evalObj.decision).toBe("escalate");
    expect(evalObj.violations.length).toBeGreaterThan(0);
    expect(evalObj.requiredDisclosures.length).toBeGreaterThan(0);
  });
});
