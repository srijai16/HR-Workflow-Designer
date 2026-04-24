# HR Workflow Designer

A mini-module that lets HR admins **visually design and simulate** internal workflows (onboarding, leave approval, document verification) using a React Flow canvas with custom nodes, dynamic config forms, and a mock execution sandbox.

## Stack
- **React 19 + TypeScript** on TanStack Start (Vite)
- **React Flow (`reactflow`)** for the canvas
- **shadcn/ui + Tailwind v4** for UI primitives & design tokens

## Architecture

```
src/
├─ types/workflow.ts          # Strongly-typed node data, automations, simulation result
├─ api/mockApi.ts             # Mock GET /automations & POST /simulate (in-memory, async)
├─ workflow/
│  ├─ nodeDefaults.ts         # Factory for default data per node kind
│  ├─ useWorkflow.ts          # Custom hook: nodes/edges/selection state + mutations
│  ├─ nodes/CustomNodes.tsx   # 5 React Flow custom node renderers (Start/Task/Approval/Automated/End)
│  ├─ NodePalette.tsx         # Drag-source sidebar
│  ├─ NodeConfigPanel.tsx     # Dynamic per-kind config form (right rail)
│  ├─ SandboxPanel.tsx        # Run simulation + step-by-step log (bottom)
│  └─ WorkflowDesigner.tsx    # Composes layout + ReactFlowProvider
└─ routes/index.tsx           # Route entry
```

### Design choices
- **Separation of concerns**: canvas state lives in `useWorkflow` (a single hook), nodes are pure renderers driven by `data`, the API layer is fully isolated and async (easy to swap for `fetch`/MSW later).
- **Type-driven extensibility**: adding a new node kind = (1) extend `NodeKind` + `NodeDataMap`, (2) add a factory in `nodeDefaults`, (3) add a renderer in `CustomNodes`, (4) add a form branch in `NodeConfigPanel`. No other code changes.
- **Dynamic forms**: the Automated Step node fetches actions from the mock API and renders parameter inputs *based on the action's declared params* — fully data-driven.
- **Validation in the API layer**: `/simulate` performs structural checks (single Start, ≥1 End, no orphan nodes, no cycles via DFS coloring) before producing the execution trace, so the same logic would work against a real backend.
- **Single Start enforced** in `addNode`.

### Mock API
- `getAutomations()` → list of automated actions with declared params (`send_email`, `generate_doc`, `slack_notify`, `create_ticket`).
- `simulateWorkflow({ nodes, edges })` → BFS traversal from Start, emitting one `SimulationStep` per node with status `ok | warn | error` and a human-readable message. Cycle detection + connectivity validation up front.

### Assumptions
- No persistence; refreshing resets the canvas (per spec — no backend required).
- Edges are simple directed connections; conditional/branch labeling is out of scope.
- Auth/RBAC is out of scope.
- `MiniMap`, zoom controls and animated edges are included as light bonuses.

### Running
```
npm install
npm run dev
```
