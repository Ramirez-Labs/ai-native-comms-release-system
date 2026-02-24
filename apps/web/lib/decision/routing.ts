import type { Decision, Evaluation, Severity, Confidence } from "../domain/types";
import type { RuleEngineResult } from "../policy/ruleEngine";

export type RoutingConfig = {
  /** Minimum score for auto-pass when there are no violations. */
  autoPassConfidence: number;
  /** If true, route to needs_changes when uncertain instead of escalating. */
  preferNeedsChangesOnUncertainty: boolean;
};

export const DEFAULT_ROUTING_CONFIG: RoutingConfig = {
  autoPassConfidence: 0.9,
  preferNeedsChangesOnUncertainty: true,
};

/**
 * Compute a conservative confidence score based on deterministic signals.
 *
 * Philosophy:
 * - We only claim high confidence for PASS when *no* rules fired.
 * - For medium/high severity findings, confidence is “high that it needs attention”,
 *   but that does not mean it’s safe to publish.
 */
export function computeConfidence(severity: Severity, firedRuleIds: string[]): Confidence {
  if (firedRuleIds.length === 0) {
    return { score: 0.95, reason: "No policy rules fired" };
  }

  if (severity === "high") {
    return { score: 0.9, reason: "High severity rule(s) fired" };
  }

  if (severity === "medium") {
    return { score: 0.75, reason: "Medium severity rule(s) fired" };
  }

  return { score: 0.6, reason: "Low severity rule(s) fired" };
}

export type RoutingDecision = {
  decision: Decision;
  severity: Severity;
  confidence: Confidence;
  abstained: boolean;
};

/**
 * Deterministic routing — this is the core “operational responsibility” step.
 */
export function routeFromRuleEngine(
  ruleResult: RuleEngineResult,
  config: RoutingConfig = DEFAULT_ROUTING_CONFIG
): RoutingDecision {
  const { severity, firedRuleIds, violations } = ruleResult;
  const confidence = computeConfidence(severity, firedRuleIds);

  // Escalate on any high-severity violation.
  if (severity === "high") {
    return { decision: "escalate", severity, confidence, abstained: false };
  }

  // Medium severity: needs changes (blocked) unless we want to escalate by policy.
  if (severity === "medium") {
    return { decision: "needs_changes", severity, confidence, abstained: false };
  }

  // Low severity: PASS only when truly clean.
  if (violations.length === 0 && confidence.score >= config.autoPassConfidence) {
    return { decision: "pass", severity: "low", confidence, abstained: false };
  }

  // Otherwise we abstain and require human eyes.
  return {
    decision: config.preferNeedsChangesOnUncertainty ? "needs_changes" : "escalate",
    severity,
    confidence: { score: Math.min(confidence.score, 0.6), reason: "Abstained due to uncertainty" },
    abstained: true,
  };
}

export function toEvaluation(
  ruleResult: RuleEngineResult,
  evaluatedAtIso: string,
  routing: RoutingDecision
): Evaluation {
  return {
    evaluatedAt: evaluatedAtIso,
    policyVersion: ruleResult.policyVersion,

    decision: routing.decision,
    severity: routing.severity,
    confidence: routing.confidence,

    violations: ruleResult.violations,
    requiredDisclosures: ruleResult.requiredDisclosures,

    abstained: routing.abstained,
  };
}
