import type { Automation, SimulationResult, SimulationStep } from "@/types/workflow";
import type { Edge, Node } from "reactflow";

const AUTOMATIONS: Automation[] = [
  { id: "send_email", label: "Send Email", params: ["to", "subject", "body"] },
  { id: "generate_doc", label: "Generate Document", params: ["template", "recipient"] },
  { id: "slack_notify", label: "Notify on Slack", params: ["channel", "message"] },
  { id: "create_ticket", label: "Create Ticket", params: ["system", "title", "priority"] },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getAutomations(): Promise<Automation[]> {
  await delay(150);
  return AUTOMATIONS;
}

export interface SimulatePayload {
  nodes: Node[];
  edges: Edge[];
}

function detectCycle(nodes: Node[], edges: Edge[]): boolean {
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => adj.get(e.source)?.push(e.target));
  const WHITE = 0,
    GRAY = 1,
    BLACK = 2;
  const color = new Map<string, number>();
  nodes.forEach((n) => color.set(n.id, WHITE));
  const dfs = (u: string): boolean => {
    color.set(u, GRAY);
    for (const v of adj.get(u) ?? []) {
      if (color.get(v) === GRAY) return true;
      if (color.get(v) === WHITE && dfs(v)) return true;
    }
    color.set(u, BLACK);
    return false;
  };
  for (const n of nodes) if (color.get(n.id) === WHITE && dfs(n.id)) return true;
  return false;
}

export async function simulateWorkflow(payload: SimulatePayload): Promise<SimulationResult> {
  await delay(300);
  const { nodes, edges } = payload;
  const errors: string[] = [];

  const startNodes = nodes.filter((n) => n.type === "start");
  const endNodes = nodes.filter((n) => n.type === "end");
  if (startNodes.length === 0) errors.push("Workflow must have a Start node.");
  if (startNodes.length > 1) errors.push("Workflow must have exactly one Start node.");
  if (endNodes.length === 0) errors.push("Workflow must have at least one End node.");
  if (detectCycle(nodes, edges)) errors.push("Cycle detected in workflow graph.");

  // Connectivity
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();
  nodes.forEach((n) => {
    incoming.set(n.id, 0);
    outgoing.set(n.id, 0);
  });
  edges.forEach((e) => {
    outgoing.set(e.source, (outgoing.get(e.source) ?? 0) + 1);
    incoming.set(e.target, (incoming.get(e.target) ?? 0) + 1);
  });
  nodes.forEach((n) => {
    if (n.type !== "start" && (incoming.get(n.id) ?? 0) === 0)
      errors.push(`Node "${(n.data as { label?: string })?.label ?? n.id}" has no incoming connection.`);
    if (n.type !== "end" && (outgoing.get(n.id) ?? 0) === 0)
      errors.push(`Node "${(n.data as { label?: string })?.label ?? n.id}" has no outgoing connection.`);
  });

  if (errors.length > 0) {
    return { ok: false, steps: [], errors };
  }

  // BFS traversal from start
  const adj = new Map<string, string[]>();
  edges.forEach((e) => {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source)!.push(e.target);
  });
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const steps: SimulationStep[] = [];
  const visited = new Set<string>();
  const queue: string[] = [startNodes[0].id];
  let t = Date.now();

  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const n = nodeMap.get(id);
    if (!n) continue;
    const data = n.data as { label?: string };
    const kind = (n.type ?? "task") as SimulationStep["kind"];
    let message = "Executed";
    let status: SimulationStep["status"] = "ok";
    switch (kind) {
      case "start":
        message = "Workflow started";
        break;
      case "task": {
        const td = n.data as { assignee?: string; dueDate?: string };
        message = `Task assigned to ${td.assignee || "unassigned"}${td.dueDate ? ` (due ${td.dueDate})` : ""}`;
        if (!td.assignee) status = "warn";
        break;
      }
      case "approval": {
        const ad = n.data as { approverRole?: string; autoApproveThreshold?: number };
        message = `Awaiting approval from ${ad.approverRole || "?"} (auto-approve ≥ ${ad.autoApproveThreshold ?? 0})`;
        break;
      }
      case "automated": {
        const ad = n.data as { actionId?: string; params?: Record<string, string> };
        message = `Triggered action "${ad.actionId || "none"}" with ${Object.keys(ad.params ?? {}).length} param(s)`;
        if (!ad.actionId) status = "warn";
        break;
      }
      case "end":
        message = (n.data as { endMessage?: string }).endMessage || "Workflow completed";
        break;
    }
    steps.push({
      nodeId: id,
      label: data.label ?? id,
      kind,
      status,
      message,
      timestamp: t,
    });
    t += 120;
    for (const next of adj.get(id) ?? []) queue.push(next);
  }

  return { ok: true, steps, errors: [] };
}
