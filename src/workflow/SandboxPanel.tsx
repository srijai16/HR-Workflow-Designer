import { useState } from "react";
import type { Edge, Node } from "reactflow";
import { simulateWorkflow } from "@/api/mockApi";
import type { SimulationResult } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import { Play, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface Props {
  nodes: Node[];
  edges: Edge[];
}

export function SandboxPanel({ nodes, edges }: Props) {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setResult(null);
    const r = await simulateWorkflow({ nodes, edges });
    setResult(r);
    setLoading(false);
  };

  return (
    <div className="border-t bg-card flex flex-col" style={{ height: 240 }}>
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div>
          <div className="text-sm font-bold">Test Sandbox</div>
          <div className="text-xs text-muted-foreground">
            Validate &amp; simulate workflow execution
          </div>
        </div>
        <Button onClick={run} disabled={loading} size="sm">
          <Play className="h-4 w-4 mr-1" />
          {loading ? "Running..." : "Run Simulation"}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {!result && (
          <div className="text-xs text-muted-foreground">
            Click "Run Simulation" to validate the workflow and view a step-by-step execution log.
          </div>
        )}
        {result && !result.ok && (
          <div className="space-y-1">
            {result.errors.map((e, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{e}</span>
              </div>
            ))}
          </div>
        )}
        {result && result.ok && (
          <ol className="space-y-1.5">
            {result.steps.map((s, i) => {
              const Icon = s.status === "ok" ? CheckCircle2 : s.status === "warn" ? Clock : AlertCircle;
              const color =
                s.status === "ok"
                  ? "text-[oklch(0.6_0.16_150)]"
                  : s.status === "warn"
                    ? "text-[oklch(0.7_0.17_60)]"
                    : "text-destructive";
              return (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-xs font-mono text-muted-foreground w-6">{i + 1}.</span>
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                  <div>
                    <span className="font-semibold text-foreground">{s.label}</span>
                    <span className="text-xs uppercase text-muted-foreground ml-2">[{s.kind}]</span>
                    <div className="text-xs text-muted-foreground">{s.message}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
