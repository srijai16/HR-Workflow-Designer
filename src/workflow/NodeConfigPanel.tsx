import { useEffect, useState } from "react";
import type { Node } from "reactflow";
import type { Automation, KV } from "@/types/workflow";
import { getAutomations } from "@/api/mockApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

interface Props {
  node: Node | null;
  onChange: (id: string, patch: Record<string, unknown>) => void;
  onDelete: () => void;
}

function KVEditor({ items, onChange }: { items: KV[]; onChange: (next: KV[]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((kv, i) => (
        <div key={i} className="flex gap-2">
          <Input
            placeholder="key"
            value={kv.key}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], key: e.target.value };
              onChange(next);
            }}
          />
          <Input
            placeholder="value"
            value={kv.value}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], value: e.target.value };
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, { key: "", value: "" }])}
      >
        <Plus className="h-4 w-4 mr-1" /> Add
      </Button>
    </div>
  );
}

export function NodeConfigPanel({ node, onChange, onDelete }: Props) {
  const [automations, setAutomations] = useState<Automation[]>([]);

  useEffect(() => {
    getAutomations().then(setAutomations);
  }, []);

  if (!node) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Select a node to edit its properties, or drag a new node from the palette.
      </div>
    );
  }

  const kind = node.type as string;
  const data = node.data as Record<string, unknown>;
  const set = (patch: Record<string, unknown>) => onChange(node.id, patch);

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{kind} node</div>
          <div className="text-sm font-bold text-foreground">{(data.label as string) || "Untitled"}</div>
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete} title="Delete node">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div>
        <Label>Title</Label>
        <Input value={(data.label as string) ?? ""} onChange={(e) => set({ label: e.target.value })} />
      </div>

      {kind === "start" && (
        <div>
          <Label>Metadata</Label>
          <KVEditor items={(data.metadata as KV[]) ?? []} onChange={(next) => set({ metadata: next })} />
        </div>
      )}

      {kind === "task" && (
        <>
          <div>
            <Label>Description</Label>
            <Textarea
              value={(data.description as string) ?? ""}
              onChange={(e) => set({ description: e.target.value })}
            />
          </div>
          <div>
            <Label>Assignee</Label>
            <Input
              value={(data.assignee as string) ?? ""}
              onChange={(e) => set({ assignee: e.target.value })}
              placeholder="e.g. john@acme.com"
            />
          </div>
          <div>
            <Label>Due date</Label>
            <Input
              type="date"
              value={(data.dueDate as string) ?? ""}
              onChange={(e) => set({ dueDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Custom fields</Label>
            <KVEditor
              items={(data.customFields as KV[]) ?? []}
              onChange={(next) => set({ customFields: next })}
            />
          </div>
        </>
      )}

      {kind === "approval" && (
        <>
          <div>
            <Label>Approver role</Label>
            <Select
              value={(data.approverRole as string) ?? ""}
              onValueChange={(v) => set({ approverRole: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {["Manager", "HRBP", "Director", "CEO"].map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Auto-approve threshold</Label>
            <Input
              type="number"
              value={(data.autoApproveThreshold as number) ?? 0}
              onChange={(e) => set({ autoApproveThreshold: Number(e.target.value) })}
            />
          </div>
        </>
      )}

      {kind === "automated" && (
        <>
          <div>
            <Label>Action</Label>
            <Select
              value={(data.actionId as string) ?? ""}
              onValueChange={(v) => set({ actionId: v, params: {} })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an action" />
              </SelectTrigger>
              <SelectContent>
                {automations.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(() => {
            const action = automations.find((a) => a.id === data.actionId);
            if (!action) return null;
            const params = (data.params as Record<string, string>) ?? {};
            return (
              <div className="space-y-2">
                <Label>Parameters</Label>
                {action.params.map((p) => (
                  <div key={p}>
                    <Label className="text-xs text-muted-foreground">{p}</Label>
                    <Input
                      value={params[p] ?? ""}
                      onChange={(e) => set({ params: { ...params, [p]: e.target.value } })}
                    />
                  </div>
                ))}
              </div>
            );
          })()}
        </>
      )}

      {kind === "end" && (
        <>
          <div>
            <Label>End message</Label>
            <Textarea
              value={(data.endMessage as string) ?? ""}
              onChange={(e) => set({ endMessage: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show summary</Label>
            <Switch
              checked={!!data.summary}
              onCheckedChange={(v) => set({ summary: v })}
            />
          </div>
        </>
      )}
    </div>
  );
}
