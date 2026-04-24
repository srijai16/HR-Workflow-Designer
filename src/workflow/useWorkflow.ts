import { useCallback, useState } from "react";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from "reactflow";
import type { NodeKind } from "@/types/workflow";
import { defaultData } from "@/workflow/nodeDefaults";

let idCounter = 1;
const nextId = () => `n_${idCounter++}`;

const initialNodes: Node[] = [
  {
    id: nextId(),
    type: "start",
    position: { x: 280, y: 60 },
    data: defaultData("start"),
  },
];

export function useWorkflow() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect = useCallback(
    (c: Connection) => setEdges((eds) => addEdge({ ...c, animated: true }, eds)),
    [],
  );

  const addNode = useCallback((kind: NodeKind, position: { x: number; y: number }) => {
    if (kind === "start") {
      // enforce single start
      // we still allow adding but warn — simpler to block
    }
    setNodes((nds) => {
      if (kind === "start" && nds.some((n) => n.type === "start")) return nds;
      return [...nds, { id: nextId(), type: kind, position, data: defaultData(kind) }];
    });
  }, []);

  const updateNodeData = useCallback((id: string, data: Record<string, unknown>) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)));
  }, []);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  return {
    nodes,
    edges,
    selectedId,
    selectedNode,
    setSelectedId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeData,
    deleteSelected,
  };
}
