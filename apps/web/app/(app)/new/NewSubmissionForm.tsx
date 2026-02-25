"use client";

import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";

import { createCaseAction, type CreateCaseState } from "./actions";
import { fixtureDrafts } from "../../../lib/fixtures/drafts";

const INITIAL: CreateCaseState = { ok: true };

export function NewSubmissionForm() {
  const [state, formAction, pending] = useActionState(createCaseAction, INITIAL);
  const [selectedDemo, setSelectedDemo] = useState<string>("autoPass");
  const [draft, setDraft] = useState<string>(fixtureDrafts.autoPass.text);

  const demoText = useMemo(() => {
    if (selectedDemo === "autoPass") return fixtureDrafts.autoPass.text;
    if (selectedDemo === "needsChanges") return fixtureDrafts.needsChanges.text;
    if (selectedDemo === "escalate") return fixtureDrafts.escalate.text;
    return fixtureDrafts.autoPass.text;
  }, [selectedDemo]);

  useEffect(() => {
    // Make the demo dropdown actually update the textarea (defaultValue only applies on first render).
    setDraft(demoText);
  }, [demoText]);

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <form className="space-y-5" action={formAction}>
          {state.ok === false ? (
            <div className="alert alert-error">
              <span className="text-sm">{state.message}</span>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text">Demo draft</span>
              </div>
              <select
                className="select select-bordered w-full"
                value={selectedDemo}
                onChange={(e) => setSelectedDemo(e.target.value)}
              >
                <option value="autoPass">Auto-pass</option>
                <option value="needsChanges">Needs changes</option>
                <option value="escalate">Escalate</option>
              </select>
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Channel</span>
              </div>
              <select className="select select-bordered w-full" name="channel" defaultValue="email">
                <option value="email">Email</option>
                <option value="push">Push</option>
                <option value="landing_page">Landing page</option>
                <option value="blog">Blog</option>
              </select>
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Product</span>
              </div>
              <input className="input input-bordered w-full" name="product" placeholder="e.g. Cash account" />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Audience</span>
              </div>
              <input className="input input-bordered w-full" name="audience" placeholder="e.g. New users" />
            </label>
          </div>

          <label className="form-control">
            <div className="label">
              <span className="label-text">Draft</span>
              <span className="label-text-alt text-base-content/60">Paste the full copy to review.</span>
            </div>
            <textarea
              className="textarea textarea-bordered w-full min-h-[260px] font-mono text-[13px] leading-5"
              name="draft"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button className="btn btn-primary" type="submit" disabled={pending}>
              {pending ? "Submitting…" : "Submit for review"}
            </button>
          </div>

          <div className="text-xs text-base-content/60">
            Demo tip: use the dropdown to quickly generate Pass / Needs changes / Escalate examples.
          </div>
        </form>
      </div>
    </div>
  );
}
