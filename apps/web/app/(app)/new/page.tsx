import { PageHeader } from "../../../components/PageHeader";
import { NewSubmissionForm } from "./NewSubmissionForm";

export default function NewSubmissionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New submission"
        subtitle="Submit outbound copy for a routed decision: pass, needs changes, or escalate."
      />

      <NewSubmissionForm />
    </div>
  );
}
