import type { DraftSubmission, Severity, Violation, Citation } from "../domain/types";
import type { PolicyPack, PolicyRule } from "./types";

function maxSeverity(a: Severity, b: Severity): Severity {
  const order: Record<Severity, number> = { low: 0, medium: 1, high: 2 };
  return order[b] > order[a] ? b : a;
}

function compilePatterns(rule: PolicyRule): RegExp[] {
  return rule.patterns.map((p) => new RegExp(p, "ig"));
}

function findFirstMatch(text: string, re: RegExp): { start: number; end: number; snippet: string } | null {
  re.lastIndex = 0;
  const m = re.exec(text);
  if (!m || m.index == null) return null;
  const start = m.index;
  const end = start + m[0].length;
  const snippet = text.slice(start, Math.min(text.length, end + 40));
  return { start, end, snippet };
}

function toCitation(match: { start: number; end: number; snippet: string }): Citation {
  return {
    // Sentence mapping becomes stable in PR4. For now, we set 0.
    sentenceIndex: 0,
    start: match.start,
    end: match.end,
    snippet: match.snippet,
  };
}

export type RuleEngineResult = {
  policyVersion: string;
  violations: Violation[];
  requiredDisclosures: string[];
  severity: Severity;
  /** Metadata for debugging/testing */
  firedRuleIds: string[];
};

export function evaluateDeterministicRules(
  submission: DraftSubmission,
  policy: PolicyPack
): RuleEngineResult {
  const text = submission.text;
  let severity: Severity = "low";

  const violations: Violation[] = [];
  const disclosures = new Set<string>();
  const firedRuleIds: string[] = [];

  for (const rule of policy.rules) {
    const regexes = compilePatterns(rule);

    // Fire rule if any pattern matches.
    for (const re of regexes) {
      const match = findFirstMatch(text, re);
      if (!match) continue;

      firedRuleIds.push(rule.id);
      severity = maxSeverity(severity, rule.severity);
      (rule.requiredDisclosures ?? []).forEach((d) => disclosures.add(d));

      violations.push({
        ruleId: rule.id,
        severity: rule.severity,
        message: rule.message,
        citation: toCitation(match),
        requiredDisclosures: rule.requiredDisclosures,
      });

      break; // only one violation per rule for now
    }
  }

  return {
    policyVersion: policy.policyVersion,
    violations,
    requiredDisclosures: Array.from(disclosures),
    severity,
    firedRuleIds,
  };
}
