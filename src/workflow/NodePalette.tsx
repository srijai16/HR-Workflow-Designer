import type { NodeKind } from "@/types/workflow";
import { NODE_LABELS } from "@/workflow/nodeDefaults";

const KINDS: { kind: NodeKind; desc: string; color: string }[] = [
  { kind: "start", desc: "Workflow entry point", color: "var(--node-start)" },
  { kind: "task", desc: "Human task", color: "var(--node-task)" },
  { kind: "approval", desc: "Approval step", color: "var(--node-approval)" },
  { kind: "automated", desc: "System action", color: "var(--node-auto)" },
  { kind: "end", desc: "Workflow completion", color: "var(--node-end)" },
];

export function NodePalette() {
  return (
    <div className="p-4 space-y-3">
      <div>
        <h2 className="text-sm font-bold text-foreground">Node Palette</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Drag nodes onto the canvas</p>
      </div>
      <div className="space-y-2">
        {KINDS.map((k) => (
          <div
            key={k.kind}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("application/reactflow", k.kind);
              e.dataTransfer.effectAllowed = "move";
            }}
            className="cursor-grab active:cursor-grabbing rounded-lg border bg-card p-3 hover:shadow-md transition-shadow"
            style={{ borderLeftWidth: 4, borderLeftColor: k.color }}
          >
            <div className="text-sm font-semibold text-foreground">{NODE_LABELS[k.kind]}</div>
            <div className="text-xs text-muted-foreground">{k.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
