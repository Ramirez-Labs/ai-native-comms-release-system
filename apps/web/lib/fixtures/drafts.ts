import type { DraftSubmission } from "../domain/types";

export const fixtureDrafts = {
  autoPass: {
    context: { channel: "email", product: "Cash account", audience: "All users" },
    text: [
      "Hi there — quick update.",
      "We’ve improved the app settings experience.",
      "Learn more in the Help Center.",
    ].join("\n"),
  } satisfies DraftSubmission,

  needsChanges: {
    context: { channel: "push", product: "Investing", audience: "New users" },
    text: [
      "Get the best returns with our investing account.",
      "No risk. Start today.",
    ].join("\n"),
  } satisfies DraftSubmission,

  escalate: {
    context: { channel: "landing_page", product: "Managed investing", audience: "Prospects" },
    text: [
      "Guaranteed 12% returns — beat the market.",
      "Zero fees forever.",
    ].join("\n"),
  } satisfies DraftSubmission,
};
