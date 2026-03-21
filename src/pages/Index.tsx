import { useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Search, Check, Minus, X, Users, Download } from "lucide-react";
import { useControls } from "@/hooks/use-framework-data";
import { useClientStore } from "@/hooks/use-client-store";
import { PILLARS, IG_LEVELS, LIFECYCLE_TRIGGERS, type Control } from "@/lib/csv-loader";
import { getClientProgress, type ControlStatus } from "@/lib/client-store";
import * as XLSX from "xlsx";

const IG_META: Record<string, { label: string; sub: string }> = {
  IG1: { label: "IG1 — Essential", sub: "Minimum safe floor" },
  IG2: { label: "IG2 — Managed", sub: "Repeatable practice" },
  IG3: { label: "IG3 — Advanced", sub: "Mature & regulated" },
};

const PILLAR_COLORS: Record<string, string> = {
  STR: "90 37% 28%",
  GOV: "280 30% 40%",
  TEC: "168 40% 30%",
  PRC: "25 70% 46%",
  DAT: "340 45% 42%",
  OBS: "200 50% 36%",
  DEP: "46 60% 38%",
};

const Index = () => {
  const { data: controls = [], isLoading } = useControls();
  const { clients, addClient, removeClient, updateStatus } = useClientStore();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [search, setSearch] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("all");
  const [activeControl, setActiveControl] = useState<Control | null>(null);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const filteredControls = useMemo(() => {
    return controls.filter((c) => {
      if (lifecycleFilter !== "all" && c.lifecycleTrigger !== lifecycleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.controlId.toLowerCase().includes(q) ||
          c.safeguardTitle.toLowerCase().includes(q) ||
          c.customerObjective.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [controls, search, lifecycleFilter]);

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

  const handleDownloadXlsx = useCallback(() => {
    const rows = controls.map((c) => ({
      "Control ID": c.controlId,
      "Pillar": c.pillar,
      "IG": c.ig,
      "Safeguard Title": c.safeguardTitle,
      "Customer Objective": c.customerObjective,
      "Detailed Requirement": c.detailedRequirement,
      "Lifecycle Trigger": c.lifecycleTrigger,
      "Cadence": c.cadence,
      "Primary Stakeholder": c.primaryStakeholder,
      "Microsoft Tool Recommendation": c.microsoftTool,
      "Generic Tooling Category": c.genericTooling,
      "Evidence of Completion": c.evidenceOfCompletion,
      "Applies To": c.appliesTo,
      "Notes / Guardrails": c.notesGuardrails,
      ...(selectedClient ? { "Status": getStatus(c.controlId) } : {}),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Controls");
    XLSX.writeFile(wb, `ai-enablement-framework${selectedClient ? `-${selectedClient.name}` : ""}.xlsx`);
  }, [controls, selectedClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading framework…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-auto">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-1.5 flex items-center gap-3 shadow-sm">
        <h1 className="text-sm font-serif font-semibold mr-3 hidden sm:block">AI Enablement Framework</h1>
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

        <select
          value={lifecycleFilter}
          onChange={(e) => setLifecycleFilter(e.target.value)}
          className="text-xs font-medium border border-border rounded-md px-2 py-1.5 bg-card focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
        >
          <option value="all">All Lifecycle Triggers</option>
          {LIFECYCLE_TRIGGERS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

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
                className="h-full rounded-full transition-all bg-status-green"
                style={{ width: `${progress.percentage}%` }}
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
          <div className="sticky top-[37px] z-20 bg-background border-b border-border grid grid-cols-[100px_repeat(7,1fr)]">
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-end" />
            {PILLARS.map((p) => (
              <div key={p.id} className="px-2 py-1.5 border-l border-border">
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
              <div key={ig} className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-border">
                <div
                  className="px-3 py-3 flex flex-col justify-start sticky left-0 z-10"
                  style={{ background: `hsl(var(${igBgVar}))` }}
                >
                  <span className="text-xs font-bold" style={{ color: `hsl(var(${igColorVar}))` }}>
                    {ig}
                  </span>
                  <span className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                    {meta.sub}
                  </span>
                </div>

                {PILLARS.map((pillar) => {
                  const items = grid[pillar.id]?.[ig] || [];
                  return (
                    <div key={`${pillar.id}-${ig}`} className="border-l border-border px-1.5 py-1.5 space-y-1 bg-card/50">
                      {items.map((c) => {
                        const status = getStatus(c.controlId);
                        return (
                          <button
                            key={c.controlId}
                            onClick={() => setActiveControl(c)}
                            className={`w-full rounded-md border text-[11px] transition-all text-left px-1.5 py-1.5 hover:shadow-md active:scale-[0.97] cursor-pointer ${
                              status === "complete"
                                ? "bg-status-green/10 border-status-green/30"
                                : status === "in-progress"
                                ? "bg-status-yellow/10 border-status-yellow/30"
                                : status === "not-applicable"
                                ? "bg-muted/60 border-border opacity-50"
                                : "bg-card border-border hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-start gap-1.5">
                              {selectedClient && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cycleStatus(c.controlId);
                                  }}
                                  className={`mt-0.5 w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center border transition-all active:scale-90 ${
                                    status === "complete"
                                      ? "bg-status-green border-status-green"
                                      : status === "in-progress"
                                      ? "bg-status-yellow border-status-yellow"
                                      : status === "not-applicable"
                                      ? "bg-muted-foreground/30 border-muted-foreground/30"
                                      : "border-border hover:border-primary"
                                  }`}
                                >
                                  {status === "complete" && <Check className="w-2 h-2 text-primary-foreground" />}
                                  {status === "in-progress" && <Minus className="w-2 h-2 text-primary-foreground" />}
                                  {status === "not-applicable" && <X className="w-2 h-2 text-primary-foreground" />}
                                </span>
                              )}
                              <div className="flex-1 min-w-0">
                                <span className={`leading-tight block ${status === "complete" ? "line-through text-muted-foreground" : ""}`}>
                                  {c.safeguardTitle}
                                </span>
                                <span className="text-[9px] font-mono text-muted-foreground block mt-0.5">
                                  {c.controlId}
                                </span>
                              </div>
                            </div>
                          </button>
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

      {/* Detail Panel (slide-over) */}
      {activeControl && (
        <>
          <div
            className="fixed inset-0 bg-foreground/20 z-40"
            onClick={() => setActiveControl(null)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 shadow-xl overflow-y-auto animate-fade-up"
            style={{ animationDuration: "250ms" }}
          >
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground">{activeControl.controlId}</span>
                <h2 className="text-lg font-serif font-semibold mt-0.5 leading-snug">{activeControl.safeguardTitle}</h2>
                <span className={`inline-block mt-1.5 ${activeControl.ig === "IG1" ? "ig1-badge" : activeControl.ig === "IG2" ? "ig2-badge" : "ig3-badge"}`}>
                  {activeControl.ig} — {activeControl.ig === "IG1" ? "Essential" : activeControl.ig === "IG2" ? "Managed" : "Advanced"}
                </span>
              </div>
              <button
                onClick={() => setActiveControl(null)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Status controls */}
              {selectedClient && (
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Status</h3>
                  <div className="flex gap-1.5">
                    {([
                      { val: "not-started", label: "Not Started" },
                      { val: "in-progress", label: "In Progress" },
                      { val: "complete", label: "Complete" },
                      { val: "not-applicable", label: "N/A" },
                    ] as const).map((opt) => {
                      const current = getStatus(activeControl.controlId);
                      const isActive = current === opt.val;
                      return (
                        <button
                          key={opt.val}
                          onClick={() => updateStatus(selectedClient.id, activeControl.controlId, opt.val)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
                            isActive
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-border hover:bg-muted"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <DetailSection title="Customer Objective" value={activeControl.customerObjective} />
              <DetailSection title="Detailed Requirement" value={activeControl.detailedRequirement} />

              <div className="grid grid-cols-2 gap-4">
                <DetailSection title="Lifecycle Trigger" value={activeControl.lifecycleTrigger} />
                <DetailSection title="Cadence" value={activeControl.cadence} />
                <DetailSection title="Primary Stakeholder" value={activeControl.primaryStakeholder} />
                <DetailSection title="Applies To" value={activeControl.appliesTo} />
              </div>

              <DetailSection title="Microsoft Tooling" value={activeControl.microsoftTool} />
              <DetailSection title="Generic Tooling" value={activeControl.genericTooling} />
              <DetailSection title="Evidence of Completion" value={activeControl.evidenceOfCompletion} />

              {activeControl.notesGuardrails && (
                <div className="bg-status-yellow/10 border border-status-yellow/30 rounded-lg p-3">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-status-yellow mb-1">Notes & Guardrails</h3>
                  <p className="text-sm leading-relaxed">{activeControl.notesGuardrails}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* No client hint */}
      {!selectedClient && clients.length === 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-medium px-4 py-2 rounded-full shadow-lg animate-fade-up">
          Click "+ New" above to create a client and start tracking progress
        </div>
      )}
    </div>
  );
};

function DetailSection({ title, value }: { title: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{title}</h3>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}

export default Index;
