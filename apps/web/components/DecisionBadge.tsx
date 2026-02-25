import type { Decision, Severity } from "../lib/domain/types";

function decisionToLabel(decision: Decision): string {
  if (decision === "pass") return "Pass";
  if (decision === "needs_changes") return "Needs changes";
  return "Escalate";
}

export function DecisionBadge({
  decision,
  severity,
}: {
  decision: Decision;
  severity?: Severity;
}) {
  const variant =
    decision === "pass"
      ? "badge-success"
      : decision === "needs_changes"
        ? "badge-warning"
        : "badge-error";

  const tone =
    severity === "high"
      ? "border-error/40"
      : severity === "medium"
        ? "border-warning/40"
        : "border-base-300";

  return (
    <span className={`badge badge-outline font-medium ${variant} ${tone}`}>
      {decisionToLabel(decision)}
    </span>
  );
}
