import Link from "next/link";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="btn btn-ghost btn-sm justify-start px-3 text-base-content/80 hover:text-base-content"
    >
      {label}
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="navbar bg-base-100 border-b border-base-300">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-base-200 border border-base-300 grid place-items-center">
                <span className="text-sm font-semibold">RG</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">Release Gate</div>
                <div className="text-xs text-base-content/60">Comms governance workflow</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/new" className="btn btn-primary btn-sm">
                New submission
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
          <aside className="space-y-2">
            <div className="text-xs font-semibold text-base-content/50 px-3">Workspace</div>
            <nav className="flex flex-col gap-1">
              <NavLink href="/queue" label="Queue" />
              <NavLink href="/new" label="New submission" />
            </nav>
          </aside>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
