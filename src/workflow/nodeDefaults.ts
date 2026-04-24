import type { NodeKind, NodeDataMap, StartData, TaskData, ApprovalData, AutomatedData, EndData } from "@/types/workflow";

export const NODE_LABELS: Record<NodeKind, string> = {
  start: "Start",
  task: "Task",
  approval: "Approval",
  automated: "Automated Step",
  end: "End",
};

const factories = {
  start: (): StartData => ({ label: "Start", metadata: [] }),
  task: (): TaskData => ({ label: "New Task", description: "", assignee: "", dueDate: "", customFields: [] }),
  approval: (): ApprovalData => ({ label: "Approval", approverRole: "Manager", autoApproveThreshold: 0 }),
  automated: (): AutomatedData => ({ label: "Automated Step", actionId: "", params: {} }),
  end: (): EndData => ({ label: "End", endMessage: "Workflow complete", summary: false }),
};

export function defaultData<K extends NodeKind>(kind: K): NodeDataMap[K] {
  return factories[kind]() as NodeDataMap[K];
}
