import { useState, useMemo } from "react";
import { Plus, Trash2, Users, ChevronRight } from "lucide-react";
import { useControls } from "@/hooks/use-framework-data";
import { useClientStore } from "@/hooks/use-client-store";
import { IGBadge, ContentAreaDot, StatusSelect } from "@/components/FrameworkBadges";
import { PILLARS, CONTENT_AREAS, getPillarId, getContentAreaPrefix, type Control } from "@/lib/csv-loader";
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

  const progress = useMemo(() => {
    if (!selectedClient) return null;
    return getClientProgress(selectedClient, controls.length);
  }, [selectedClient, controls]);

  if (isLoading) {
    return <div className="animate-pulse text-muted-foreground text-center py-16">Loading…</div>;
  }

  if (!selectedClient) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h1 className="text-xl font-bold mb-1">Client Tracker</h1>
          <p className="text-sm text-muted-foreground">Track implementation progress per client.</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="New client name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim()) {
                  addClient(newName.trim());
                  setNewName("");
                }
              }}
              className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
            <button
              onClick={() => {
                if (newName.trim()) {
                  addClient(newName.trim());
                  setNewName("");
                }
              }}
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {clients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No clients yet. Add one above.</p>
          ) : (
            <div className="space-y-2">
              {clients.map((client) => {
                const prog = getClientProgress(client, controls.length);
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-left"
                  >
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {prog.complete} complete ({prog.percentage}%)
                      </p>
                    </div>
                    <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${prog.percentage}%`,
                          background: `hsl(var(--ig1))`,
                        }}
                      />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Client header */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setSelectedClientId(null)}
              className="text-xs text-muted-foreground hover:text-foreground mb-1 flex items-center gap-1"
            >
              ← All clients
            </button>
            <h2 className="text-lg font-bold">{selectedClient.name}</h2>
            {progress && (
              <p className="text-sm text-muted-foreground">
                {progress.complete} complete ({progress.percentage}%)
              </p>
            )}
          </div>
          <button
            onClick={() => {
              if (confirm(`Remove ${selectedClient.name}?`)) {
                removeClient(selectedClient.id);
                setSelectedClientId(null);
              }
            }}
            className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* IG filter */}
      <div className="flex gap-2">
        {["all", "IG1", "IG2", "IG3"].map((v) => (
          <button
            key={v}
            onClick={() => setIgFilter(v)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              igFilter === v
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/40"
            }`}
          >
            {v === "all" ? "All" : v}
          </button>
        ))}
      </div>

      {/* Controls checklist grouped by pillar */}
      {PILLARS.map((pillar) => {
        const items = filteredControls.filter((c) => getPillarId(c) === pillar.id);
        if (items.length === 0) return null;
        return (
          <div key={pillar.id}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: `hsl(${pillar.color})` }}
              />
              <h3 className="text-sm font-semibold">{pillar.name}</h3>
            </div>
            <div className="space-y-1">
              {items.map((c) => {
                const status = (selectedClient.controlStatuses[c.controlId] || "not-started") as ControlStatus;
                return (
                  <div
                    key={c.controlId}
                    className="flex items-center gap-3 p-2 rounded-md border border-border bg-card"
                  >
                    <ContentAreaDot prefix={getContentAreaPrefix(c)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.safeguardTitle}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{c.controlId}</p>
                    </div>
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
