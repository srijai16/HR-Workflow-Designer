import { createFileRoute } from "@tanstack/react-router";
import { WorkflowDesigner } from "@/workflow/WorkflowDesigner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "HR Workflow Designer" },
      {
        name: "description",
        content: "Visually design and test internal HR workflows like onboarding, leave approval, and document verification.",
      },
    ],
  }),
});

function Index() {
  return <WorkflowDesigner />;
}
