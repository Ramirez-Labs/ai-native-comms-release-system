import type { ReactNode } from "react";

export function EmptyStateCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/50 p-6">
      <div className="text-sm font-medium">{title}</div>
      <div className="text-sm text-base-content/70 mt-1">{description}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
