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

      const kind = e.dataTransfer.getData(
        "application/reactflow"
      ) as NodeKind;

      if (!kind) return;

      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      wf.addNode(kind, position);
    },
    [screenToFlowPosition, wf]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b bg-card px-4 py-2.5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-base font-bold text-foreground">
            HR Workflow Designer
          </h1>
          <p className="text-xs text-muted-foreground">
            Visually design onboarding, leave approval & verification flows
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          {wf.nodes.length} nodes · {wf.edges.length} edges
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-60 border-r bg-card overflow-y-auto shrink-0">
          <NodePalette />
        </aside>

        {/* Center */}
        <main className="flex flex-1 flex-col min-h-0">
          {/* React Flow Canvas */}
          <div
            ref={wrapperRef}
            className="relative flex-1 min-h-0 w-full"
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
              onNodeClick={(_, node) => wf.setSelectedId(node.id)}
              onPaneClick={() => wf.setSelectedId(null)}
              onInit={(instance) => (rfRef.current = instance)}
              nodeTypes={nodeTypes}
              fitView
              deleteKeyCode={["Backspace", "Delete"]}
            >
              <Background gap={16} size={1} />
              <Controls />
              <MiniMap pannable zoomable />
            </ReactFlow>
          </div>

          {/* Bottom Panel */}
          <div className="h-56 border-t bg-card shrink-0 overflow-auto">
            <SandboxPanel nodes={wf.nodes} edges={wf.edges} />
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 border-l bg-card shrink-0 overflow-y-auto">
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