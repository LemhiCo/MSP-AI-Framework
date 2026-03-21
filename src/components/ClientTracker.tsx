import { useState, useMemo } from "react";
import { Plus, Trash2, Users, ChevronRight } from "lucide-react";
import { useControls } from "@/hooks/use-framework-data";
import { useClientStore } from "@/hooks/use-client-store";
import { IGBadge, PillarDot, StatusSelect } from "@/components/FrameworkBadges";
import { PILLARS, type Control } from "@/lib/csv-loader";
import { getClientProgress, type ControlStatus } from "@/lib/client-store";

export default function ClientTracker() {
  const { data: controls = [], isLoading } = useControls();
  const { clients, addClient, removeClient, updateStatus } = useClientStore();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [igFilter, setIgFilter] = useState<string>("all");

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const filteredControls = useMemo(() => {
    if (igFilter === "all") return controls;
    return controls.filter((c) => c.ig === igFilter);
  }, [controls, igFilter]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const c = addClient(newName.trim());
    setSelectedClientId(c.id);
    setNewName("");
  };

  if (isLoading) {
    return <div className="animate-pulse text-muted-foreground text-center py-16">Loading…</div>;
  }

  // Client list view
  if (!selectedClient) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-1">Client Progress Tracker</h2>
          <p className="text-sm text-muted-foreground">
            Track implementation progress per client. Data is saved locally in your browser.
          </p>
        </div>

        {/* Create new client */}
        <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New client name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.97] transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          </div>
        </div>

        {/* Client list */}
        {clients.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No clients yet</p>
            <p className="text-sm mt-1">Add a client above to start tracking</p>
          </div>
        ) : (
          <div className="space-y-2">
            {clients.map((client) => {
              const progress = getClientProgress(client, controls.length);
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className="w-full bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow active:scale-[0.995] text-left"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{client.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {progress.complete} complete · {progress.inProgress} in progress · {progress.notStarted} remaining
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono tabular-nums text-muted-foreground w-8 text-right">
                      {progress.percentage}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Client detail view
  const progress = getClientProgress(selectedClient, controls.length);

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setSelectedClientId(null)}
              className="text-xs text-primary hover:underline mb-1 inline-block"
            >
              ← Back to clients
            </button>
            <h2 className="text-lg font-semibold">{selectedClient.name}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums">{progress.percentage}%</div>
              <div className="text-xs text-muted-foreground">{progress.complete} of {controls.length - progress.notApplicable} complete</div>
            </div>
            <button
              onClick={() => {
                if (confirm(`Delete client "${selectedClient.name}"?`)) {
                  removeClient(selectedClient.id);
                  setSelectedClientId(null);
                }
              }}
              className="p-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
              title="Delete client"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex gap-0.5 h-3 rounded-full overflow-hidden bg-muted">
          {progress.complete > 0 && (
            <div className="bg-emerald-500 transition-all" style={{ width: `${(progress.complete / controls.length) * 100}%` }} />
          )}
          {progress.inProgress > 0 && (
            <div className="bg-amber-400 transition-all" style={{ width: `${(progress.inProgress / controls.length) * 100}%` }} />
          )}
          {progress.notApplicable > 0 && (
            <div className="bg-slate-300 transition-all" style={{ width: `${(progress.notApplicable / controls.length) * 100}%` }} />
          )}
        </div>
        <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Complete</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> In Progress</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted" /> Not Started</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" /> N/A</span>
        </div>
      </div>

      {/* IG filter */}
      <div className="flex gap-2">
        {["all", "IG1", "IG2", "IG3"].map((v) => (
          <button
            key={v}
            onClick={() => setIgFilter(v)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors active:scale-95 ${
              igFilter === v ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"
            }`}
          >
            {v === "all" ? "All" : v}
          </button>
        ))}
      </div>

      {/* Controls checklist */}
      {PILLARS.map((pillar) => {
        const items = filteredControls.filter((c) => c.pillar === pillar.name);
        if (items.length === 0) return null;
        return (
          <div key={pillar.id}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <PillarDot pillarId={pillar.id} />
              <h3 className="text-sm font-semibold">{pillar.name}</h3>
            </div>
            <div className="space-y-1">
              {items.map((c) => {
                const status = (selectedClient.controlStatuses[c.controlId] || "not-started") as ControlStatus;
                return (
                  <div
                    key={c.controlId}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md border transition-colors ${
                      status === "complete"
                        ? "bg-emerald-50 border-emerald-200"
                        : status === "in-progress"
                        ? "bg-amber-50 border-amber-200"
                        : status === "not-applicable"
                        ? "bg-slate-50 border-slate-200 opacity-60"
                        : "bg-card border-border"
                    }`}
                  >
                    <span className="font-mono text-[10px] text-muted-foreground w-24 flex-shrink-0">{c.controlId}</span>
                    <span className={`text-sm flex-1 min-w-0 truncate ${status === "complete" ? "line-through text-muted-foreground" : ""}`}>
                      {c.safeguardTitle}
                    </span>
                    <IGBadge ig={c.ig} />
                    <StatusSelect
                      value={status}
                      onChange={(v) => updateStatus(selectedClient.id, c.controlId, v as ControlStatus)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
