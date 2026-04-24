export type NodeKind = "start" | "task" | "approval" | "automated" | "end";

export interface KV {
  key: string;
  value: string;
}

export interface StartData {
  label: string;
  metadata: KV[];
}

export interface TaskData {
  label: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KV[];
}

export interface ApprovalData {
  label: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedData {
  label: string;
  actionId: string;
  params: Record<string, string>;
}

export interface EndData {
  label: string;
  endMessage: string;
  summary: boolean;
}

export type NodeDataMap = {
  start: StartData;
  task: TaskData;
  approval: ApprovalData;
  automated: AutomatedData;
  end: EndData;
};

export type AnyNodeData = NodeDataMap[NodeKind] & { kind: NodeKind };

export interface Automation {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationStep {
  nodeId: string;
  label: string;
  kind: NodeKind;
  status: "ok" | "warn" | "error";
  message: string;
  timestamp: number;
}

export interface SimulationResult {
  ok: boolean;
  steps: SimulationStep[];
  errors: string[];
}
