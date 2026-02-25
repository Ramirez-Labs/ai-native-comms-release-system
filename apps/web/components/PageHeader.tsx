import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <div className="text-xs font-semibold text-base-content/50">{eyebrow}</div> : null}
        <h1 className="text-2xl font-semibold tracking-tight truncate">{title}</h1>
        {subtitle ? <p className="text-sm text-base-content/70 mt-1">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
