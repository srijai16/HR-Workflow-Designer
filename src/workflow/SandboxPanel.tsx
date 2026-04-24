import {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import type { Edge, Node } from "reactflow";
import { simulateWorkflow } from "@/api/mockApi";
import type { SimulationResult } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

interface Props {
  nodes: Node[];
  edges: Edge[];
  onClose?: () => void;
}

export interface SandboxPanelRef {
  run: () => void;
}

export const SandboxPanel = forwardRef<
  SandboxPanelRef,
  Props
>(({ nodes, edges, onClose }, ref) => {
  const [result, setResult] =
    useState<SimulationResult | null>(null);

  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setResult(null);

    const r = await simulateWorkflow({
      nodes,
      edges,
    });

    setResult(r);
    setLoading(false);
  };

  useImperativeHandle(ref, () => ({
    run,
  }));

  return (
    <div className="h-full bg-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div>
          <div className="text-sm font-bold">
            Simulation Result
          </div>
          <div className="text-xs text-muted-foreground">
            Validate & simulate workflow execution
          </div>
        </div>

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {!result && !loading && (
          <div className="text-sm text-muted-foreground">
            Click Run Simulation below canvas.
          </div>
        )}

        {loading && (
          <div className="text-sm text-muted-foreground">
            Running simulation...
          </div>
        )}

        {result && !result.ok && (
          <div className="space-y-2">
            {result.errors.map((e, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{e}</span>
              </div>
            ))}
          </div>
        )}

        {result && result.ok && (
          <ol className="space-y-3">
            {result.steps.map((s, i) => {
              const Icon =
                s.status === "ok"
                  ? CheckCircle2
                  : s.status === "warn"
                  ? Clock
                  : AlertCircle;

              const color =
                s.status === "ok"
                  ? "text-green-500"
                  : s.status === "warn"
                  ? "text-yellow-500"
                  : "text-destructive";

              return (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <span className="text-xs font-mono text-muted-foreground w-5">
                    {i + 1}
                  </span>

                  <Icon
                    className={`h-4 w-4 mt-0.5 ${color}`}
                  />

                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {s.label}
                      <span className="ml-2 text-xs uppercase text-muted-foreground">
                        [{s.kind}]
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      {s.message}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
});