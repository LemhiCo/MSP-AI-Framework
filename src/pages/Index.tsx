import { useState, useMemo } from "react";
import { Plus, Trash2, ChevronDown, Search, Check, Minus, X, Users } from "lucide-react";
import { useControls } from "@/hooks/use-framework-data";
import { useClientStore } from "@/hooks/use-client-store";
import { PILLARS, IG_LEVELS, type Control } from "@/lib/csv-loader";
import { getClientProgress, type ControlStatus } from "@/lib/client-store";

const IG_META: Record<string, { label: string; sub: string }> = {
  IG1: { label: "IG1 — Essential", sub: "Minimum safe floor" },
  IG2: { label: "IG2 — Managed", sub: "Repeatable practice" },
  IG3: { label: "IG3 — Advanced", sub: "Mature & regulated" },
};

const PILLAR_COLORS: Record<string, string> = {
  STR: "214 84% 36%",
  GOV: "262 52% 47%",
  TEC: "168 60% 34%",
  PRC: "24 80% 50%",
  DAT: "340 65% 47%",
  OBS: "198 80% 40%",
  DEP: "45 80% 42%",
};

const Index = () => {
  const { data: controls = [], isLoading } = useControls();
  const { clients, addClient, removeClient, updateStatus } = useClientStore();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedControl, setExpandedControl] = useState<string | null>(null);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const filteredControls = useMemo(() => {
    if (!search) return controls;
    const q = search.toLowerCase();
    return controls.filter(
      (c) =>
        c.controlId.toLowerCase().includes(q) ||
        c.safeguardTitle.toLowerCase().includes(q) ||
        c.customerObjective.toLowerCase().includes(q)
    );
  }, [controls, search]);

  const grid = useMemo(() => {
    const map: Record<string, Record<string, Control[]>> = {};
    for (const p of PILLARS) {
      map[p.id] = {};
      for (const ig of IG_LEVELS) {
        map[p.id][ig] = filteredControls.filter(
          (c) => c.controlId.startsWith(p.id) && c.ig === ig
        );
      }
    }
    return map;
  }, [filteredControls]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const c = addClient(newName.trim());
    setSelectedClientId(c.id);
    setNewName("");
    setShowNewInput(false);
  };

  const getStatus = (controlId: string): ControlStatus => {
    if (!selectedClient) return "not-started";
    return (selectedClient.controlStatuses[controlId] || "not-started") as ControlStatus;
  };

  const cycleStatus = (controlId: string) => {
    if (!selectedClient) return;
    const current = getStatus(controlId);
    const next: ControlStatus =
      current === "not-started"
        ? "complete"
        : current === "complete"
        ? "in-progress"
        : current === "in-progress"
        ? "not-applicable"
        : "not-started";
    updateStatus(selectedClient.id, controlId, next);
  };

  const progress = selectedClient ? getClientProgress(selectedClient, controls.length) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading framework…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-2.5 flex items-center gap-3 shadow-sm">
        <div className="flex items-center gap-2 mr-4">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">AI</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold leading-none">AI Enablement Framework</h1>
            <p className="text-[10px] text-muted-foreground">Customer Environment Controls</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search controls…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex-1" />

        {/* Client Selector */}
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={selectedClientId || ""}
            onChange={(e) => setSelectedClientId(e.target.value || null)}
            className="text-xs font-medium border border-border rounded-md px-2 py-1.5 bg-card focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer min-w-[120px]"
          >
            <option value="">Select client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {showNewInput ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Client name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
                className="text-xs border border-input rounded-md px-2 py-1.5 bg-background w-32 focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button onClick={handleCreate} className="p-1 rounded hover:bg-muted text-primary">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setShowNewInput(false); setNewName(""); }} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewInput(true)}
              className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" />
              New
            </button>
          )}

          {selectedClient && (
            <button
              onClick={() => {
                if (confirm(`Delete "${selectedClient.name}"?`)) {
                  removeClient(selectedClient.id);
                  setSelectedClientId(null);
                }
              }}
              className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
              title="Delete client"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Progress */}
        {progress && (
          <div className="hidden md:flex items-center gap-2 ml-2 pl-3 border-l border-border">
            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress.percentage}%`,
                  background: "hsl(var(--ig1))",
                }}
              />
            </div>
            <span className="text-xs font-mono tabular-nums text-muted-foreground">{progress.percentage}%</span>
          </div>
        )}
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Pillar Headers */}
          <div className="sticky top-[53px] z-20 bg-background border-b border-border grid grid-cols-[100px_repeat(7,1fr)]">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-end">
              IG Level
            </div>
            {PILLARS.map((p) => (
              <div
                key={p.id}
                className="px-2 py-2 border-l border-border"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: `hsl(${PILLAR_COLORS[p.id]})` }}
                  />
                  <span className="text-xs font-bold truncate">{p.id}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">{p.name}</p>
              </div>
            ))}
          </div>

          {/* IG Rows */}
          {IG_LEVELS.map((ig) => {
            const meta = IG_META[ig];
            const igColorVar = ig === "IG1" ? "--ig1" : ig === "IG2" ? "--ig2" : "--ig3";
            const igBgVar = ig === "IG1" ? "--ig1-bg" : ig === "IG2" ? "--ig2-bg" : "--ig3-bg";

            return (
              <div
                key={ig}
                className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-border"
              >
                {/* IG Label */}
                <div
                  className="px-3 py-3 flex flex-col justify-start sticky left-0 z-10"
                  style={{ background: `hsl(var(${igBgVar}))` }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: `hsl(var(${igColorVar}))` }}
                  >
                    {ig}
                  </span>
                  <span className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                    {meta.sub}
                  </span>
                </div>

                {/* Pillar Cells */}
                {PILLARS.map((pillar) => {
                  const items = grid[pillar.id]?.[ig] || [];
                  return (
                    <div
                      key={`${pillar.id}-${ig}`}
                      className="border-l border-border px-1.5 py-1.5 space-y-1 bg-card/50"
                    >
                      {items.map((c) => {
                        const status = getStatus(c.controlId);
                        const isExpanded = expandedControl === c.controlId;
                        return (
                          <div
                            key={c.controlId}
                            className={`rounded-md border text-[11px] transition-all ${
                              status === "complete"
                                ? "bg-emerald-50 border-emerald-200"
                                : status === "in-progress"
                                ? "bg-amber-50 border-amber-200"
                                : status === "not-applicable"
                                ? "bg-slate-50 border-slate-200 opacity-50"
                                : "bg-card border-border"
                            }`}
                          >
                            <div className="flex items-start gap-1 px-1.5 py-1.5">
                              {/* Checkbox */}
                              {selectedClient && (
                                <button
                                  onClick={() => cycleStatus(c.controlId)}
                                  className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all active:scale-90 ${
                                    status === "complete"
                                      ? "bg-emerald-500 border-emerald-500"
                                      : status === "in-progress"
                                      ? "bg-amber-400 border-amber-400"
                                      : status === "not-applicable"
                                      ? "bg-slate-300 border-slate-300"
                                      : "border-border hover:border-primary"
                                  }`}
                                  title="Click to cycle: Not Started → Complete → In Progress → N/A"
                                >
                                  {status === "complete" && <Check className="w-2.5 h-2.5 text-white" />}
                                  {status === "in-progress" && <Minus className="w-2.5 h-2.5 text-white" />}
                                  {status === "not-applicable" && <X className="w-2.5 h-2.5 text-white" />}
                                </button>
                              )}
                              <button
                                onClick={() => setExpandedControl(isExpanded ? null : c.controlId)}
                                className="flex-1 text-left min-w-0"
                              >
                                <span
                                  className={`leading-tight block ${
                                    status === "complete" ? "line-through text-muted-foreground" : ""
                                  }`}
                                >
                                  {c.safeguardTitle}
                                </span>
                                <span className="text-[9px] font-mono text-muted-foreground block mt-0.5">
                                  {c.controlId}
                                </span>
                              </button>
                              <ChevronDown
                                className={`w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                            {isExpanded && (
                              <div className="px-2 pb-2 pt-1 border-t border-border/50 space-y-1.5 animate-fade-up" style={{ animationDuration: "200ms" }}>
                                <p className="text-[10px] leading-relaxed text-muted-foreground">{c.customerObjective}</p>
                                <div className="text-[9px] space-y-0.5">
                                  <Detail label="Requirement" value={c.detailedRequirement} />
                                  <Detail label="Trigger" value={c.lifecycleTrigger} />
                                  <Detail label="Cadence" value={c.cadence} />
                                  <Detail label="Stakeholder" value={c.primaryStakeholder} />
                                  <Detail label="MS Tooling" value={c.microsoftTool} />
                                  <Detail label="Generic Tooling" value={c.genericTooling} />
                                  <Detail label="Evidence" value={c.evidenceOfCompletion} />
                                </div>
                                {c.notesGuardrails && (
                                  <div className="bg-amber-50 border border-amber-200 rounded px-1.5 py-1 text-[9px] text-amber-800">
                                    ⚠ {c.notesGuardrails}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {items.length === 0 && (
                        <div className="text-[10px] text-muted-foreground italic px-1 py-2">—</div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* No client hint */}
      {!selectedClient && clients.length === 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-medium px-4 py-2 rounded-full shadow-lg animate-fade-up">
          Click "+ New" above to create a client and start tracking progress
        </div>
      )}
    </div>
  );
};

function Detail({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="font-semibold text-foreground">{label}:</span>{" "}
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}

export default Index;
