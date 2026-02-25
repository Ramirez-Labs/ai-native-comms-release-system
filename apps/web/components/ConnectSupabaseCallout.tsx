import Link from "next/link";

export function ConnectSupabaseCallout({ errorMessage }: { errorMessage?: string }) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Connect Supabase</h2>
            <p className="text-sm text-base-content/70 mt-1">
              This page needs Supabase environment variables.
            </p>
          </div>
          <Link className="btn btn-outline btn-sm" href="/one-pager">
            Why Supabase?
          </Link>
        </div>

        <div className="mt-4 rounded-xl border border-base-300 bg-base-200/50 p-4">
          <div className="text-sm font-medium">Required env vars</div>
          <ul className="mt-2 text-sm text-base-content/70 list-disc pl-5 space-y-1">
            <li>
              <span className="font-mono">NEXT_PUBLIC_SUPABASE_URL</span>
            </li>
            <li>
              <span className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
            </li>
          </ul>
          {errorMessage ? (
            <div className="mt-3 text-xs text-base-content/60">
              <span className="font-semibold">Error:</span> {errorMessage}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-end">
          <a
            className="btn btn-primary btn-sm"
            href="https://github.com/Ramirez-Labs/ai-native-comms-release-system/tree/main/docs/supabase"
            target="_blank"
            rel="noreferrer"
          >
            Setup guide
          </a>
        </div>
      </div>
    </div>
  );
}
