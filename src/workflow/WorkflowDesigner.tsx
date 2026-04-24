import { useCallback, useEffect, useRef, useState } from "react";
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
import { SandboxPanel, SandboxPanelRef } from "@/workflow/SandboxPanel";
import type { NodeKind } from "@/types/workflow";
import { Play } from "lucide-react";



function CanvasInner() {
  const wf = useWorkflow();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rfRef = useRef<ReactFlowInstance | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const sandboxRef = useRef<SandboxPanelRef>(null);
  const [rightPanel, setRightPanel] = useState<"config" | "sandbox">("config");
  

    useEffect(() => {
    if (rightPanel === "sandbox") {
      sandboxRef.current?.run();
    }
  }, [rightPanel]);

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
  <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
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

    {/* Main Body */}
    <div className="flex flex-1 overflow-hidden min-h-0">

      {/* Left Sidebar */}
      <aside className="w-60 border-r bg-card overflow-y-auto shrink-0">
        <NodePalette />
      </aside>

      {/* Middle Section */}
      <main className="flex flex-1 flex-col min-w-0">

        {/* Canvas */}
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
    onNodeClick={(_, node) => {
      wf.setSelectedId(node.id);
      setRightPanel("config");
    }}
    onPaneClick={() => {
      wf.setSelectedId(null);
      setRightPanel("config");
    }}
    onInit={(instance) => (rfRef.current = instance)}
    nodeTypes={nodeTypes}
    fitView
    minZoom={0.4}
    maxZoom={1.5}
    defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
    deleteKeyCode={["Backspace", "Delete"]}
  >
    {/* Smaller Grid */}
    <Background gap={14} size={1} />

    {/* Smaller Controls */}
    <Controls
      style={{
        transform: "scale(0.85)",
        transformOrigin: "bottom left",
      }}
    />

    {/* Smaller MiniMap */}
    <MiniMap
      pannable
      zoomable
      style={{
        width: 160,
        height: 120,
      }}
      nodeStrokeWidth={2}
     
    />
  </ReactFlow>
</div>

        {/* Bottom Run Button */}
       <div className="border-t bg-card px-4 py-3 shrink-0">
        <div className="flex items-center justify-between gap-4">

          {/* Left Text */}
          <div>
            <div className="text-sm font-bold">
              Test Sandbox
            </div>
            <div className="text-xs text-muted-foreground">
              Validate & simulate workflow execution
            </div>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-2">

            <button
              onClick={() => setRightPanel("config")}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              Add Node Panel
            </button>

            <button
              onClick={() => setRightPanel("sandbox")}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Simulation
            </button>

          </div>
        </div>
      </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 border-l bg-card overflow-hidden">
      {rightPanel === "sandbox" ? (
        <SandboxPanel
          ref={sandboxRef}
          nodes={wf.nodes}
          edges={wf.edges}
          onClose={() => setRightPanel("config")}
        />
      ) : (
        <NodeConfigPanel
          node={wf.selectedNode}
          onChange={wf.updateNodeData}
          onDelete={wf.deleteSelected}
        />
      )}
    </aside>

    </div>
    <footer className="border-t bg-card px-4 py-2 shrink-0">
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      
      <div>
        © {new Date().getFullYear()} Workflow Designer
      </div>

      <div className="font-medium">
      Created by{" "}
      <a
        href="https://drive.google.com/file/d/1Vg-b0j5AfaSniIN49GrJMhM4qyNuOaJl/view?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground font-semibold hover:underline cursor-pointer"
      >
        Srijai
      </a>
    </div>

    </div>
  </footer>
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