import { Handle, Position, type NodeProps } from "reactflow";
import type { NodeKind } from "@/types/workflow";

const KIND_STYLES: Record<NodeKind, { color: string; icon: string }> = {
  start: { color: "var(--node-start)", icon: "▶" },
  task: { color: "var(--node-task)", icon: "📋" },
  approval: { color: "var(--node-approval)", icon: "✓" },
  automated: { color: "var(--node-auto)", icon: "⚙" },
  end: { color: "var(--node-end)", icon: "■" },
};

interface BaseProps extends NodeProps {
  kind: NodeKind;
  subtitle?: string;
}

export function BaseNode({ kind, data, selected, subtitle }: BaseProps) {
  const s = KIND_STYLES[kind];
  const label = (data as { label?: string })?.label ?? kind;
  return (
      <div
      className="rounded-lg border bg-card shadow-sm min-w-[120px] transition-all"
      style={{
        borderColor: selected ? s.color : "var(--border)",
        boxShadow: selected
          ? `0 0 0 2px color-mix(in oklab, ${s.color} 28%, transparent)`
          : undefined,
      }}
    >
      {kind !== "start" && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: s.color,
            width: 8,
            height: 8,
          }}
        />
      )}

      {/* Header */}
      <div
        className="px-2.5 py-1 rounded-t-lg flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide"
        style={{
          background: s.color,
          color: "white",
        }}
      >
        <span className="text-xs">{s.icon}</span>
        <span>{kind}</span>
      </div>

      {/* Body */}
      <div className="px-2.5 py-2">
        <div className="text-xs font-semibold text-foreground truncate">
          {label}
        </div>

        {subtitle && (
          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </div>
        )}
      </div>

      {kind !== "end" && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: s.color,
            width: 8,
            height: 8,
          }}
        />
      )}
    </div>
  );
}

export const StartNode = (p: NodeProps) => <BaseNode {...p} kind="start" />;
export const EndNode = (p: NodeProps) => {
  const d = p.data as { endMessage?: string };
  return <BaseNode {...p} kind="end" subtitle={d.endMessage} />;
};
export const TaskNode = (p: NodeProps) => {
  const d = p.data as { assignee?: string };
  return <BaseNode {...p} kind="task" subtitle={d.assignee ? `→ ${d.assignee}` : "no assignee"} />;
};
export const ApprovalNode = (p: NodeProps) => {
  const d = p.data as { approverRole?: string };
  return <BaseNode {...p} kind="approval" subtitle={d.approverRole} />;
};
export const AutomatedNode = (p: NodeProps) => {
  const d = p.data as { actionId?: string };
  return <BaseNode {...p} kind="automated" subtitle={d.actionId || "no action"} />;
};

export const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};
