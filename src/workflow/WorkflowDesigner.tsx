import { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { useWorkflow } from "@/workflow/useWorkflow";
import { nodeTypes } from "@/workflow/nodes/CustomNodes";
import { NodePalette } from "@/workflow/NodePalette";
import { NodeConfigPanel } from "@/workflow/NodeConfigPanel";
import { SandboxPanel } from "@/workflow/SandboxPanel";
import type { NodeKind } from "@/types/workflow";

function CanvasInner() {
  const wf = useWorkflow();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rfRef = useRef<ReactFlowInstance | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData("application/reactflow") as NodeKind;
      if (!kind) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      wf.addNode(kind, position);
    },
    [screenToFlowPosition, wf],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b bg-card px-4 py-2.5 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-foreground">HR Workflow Designer</h1>
          <p className="text-xs text-muted-foreground">
            Visually design onboarding, leave approval &amp; verification flows
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {wf.nodes.length} nodes · {wf.edges.length} edges
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-60 border-r bg-card overflow-y-auto">
          <NodePalette />
        </aside>
        <main className="flex-1 flex flex-col">
          <div
            ref={wrapperRef}
            className="flex-1 relative"
            style={{ background: "var(--canvas-bg)" }}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <ReactFlow
              nodes={wf.nodes}
              edges={wf.edges}
              onNodesChange={wf.onNodesChange}
              onEdgesChange={wf.onEdgesChange}
              onConnect={wf.onConnect}
              onNodeClick={(_, n) => wf.setSelectedId(n.id)}
              onPaneClick={() => wf.setSelectedId(null)}
              onInit={(i) => (rfRef.current = i)}
              nodeTypes={nodeTypes}
              fitView
              deleteKeyCode={["Backspace", "Delete"]}
            >
              <Background gap={16} size={1} />
              <Controls />
              <MiniMap pannable zoomable />
            </ReactFlow>
          </div>
          <SandboxPanel nodes={wf.nodes} edges={wf.edges} />
        </main>
        <aside className="w-80 border-l bg-card">
          <NodeConfigPanel
            node={wf.selectedNode}
            onChange={wf.updateNodeData}
            onDelete={wf.deleteSelected}
          />
        </aside>
      </div>
    </div>
  );
}

export function WorkflowDesigner() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
