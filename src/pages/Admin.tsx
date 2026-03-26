import { useState, useMemo, useCallback, useRef } from "react";
import { Search, Plus, Download, Upload, ArrowLeft, X } from "lucide-react";
import { useControls } from "@/hooks/use-framework-data";
import { PILLARS, IG_LEVELS, AI_MODALITIES, LIFECYCLE_TRIGGERS, type Control, parseControlsCSV } from "@/lib/csv-loader";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import ControlDetailPanel from "@/components/ControlDetailPanel";
import { toast } from "sonner";

const EMPTY_CONTROL: Control = {
  controlId: "", pillar: "", ig: "", safeguardTitle: "", customerObjective: "",
  detailedRequirement: "", lifecycleTrigger: "", cadence: "", primaryStakeholder: "",
  microsoftTool: "", genericTooling: "", evidenceOfCompletion: "", rawWeight: "",
  gateType: "", minStatusToPass: "", minEvidenceToPass: "", failCondition: "",
  whyItMatters: "", appliesTo: "", endCustomerBusinessValue: "",
  customerConversationTrack: "", whoCaresMost: "", relevantGenAI: "No",
  relevantCustomGPTs: "No", relevantAgenticAI: "No", relevantDigitalWorkers: "No",
  relevantCowork: "No", firstRequiredWhen: "",
};

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

function controlToCSVRow(c: Control): Record<string, string> {
  return {
    "Control ID": c.controlId, "Pillar": c.pillar, "IG": c.ig,
    "Safeguard Title": c.safeguardTitle, "Customer Objective": c.customerObjective,
    "Detailed Requirement": c.detailedRequirement, "Lifecycle Trigger": c.lifecycleTrigger,
    "Cadence": c.cadence, "Primary Stakeholder": c.primaryStakeholder,
    "Microsoft Tool Recommendation": c.microsoftTool, "Generic Tooling Category": c.genericTooling,
    "Evidence of Completion": c.evidenceOfCompletion, "Raw Weight": c.rawWeight,
    "Gate Type": c.gateType, "Minimum Status to Pass": c.minStatusToPass,
    "Minimum Evidence to Pass": c.minEvidenceToPass, "Fail Condition": c.failCondition,
    "Why it Matters": c.whyItMatters, "Applies To": c.appliesTo,
    "End Customer Business Value": c.endCustomerBusinessValue,
    "Customer Conversation Track": c.customerConversationTrack,
    "Who Cares Most (Customer)": c.whoCaresMost, "Relevant: GenAI": c.relevantGenAI,
    "Relevant: Custom GPTs": c.relevantCustomGPTs, "Relevant: Agentic AI": c.relevantAgenticAI,
    "Relevant: Digital Workers": c.relevantDigitalWorkers, "Relevant: Cowork": c.relevantCowork,
    "First Required When": c.firstRequiredWhen,
  };
}

function ChipFilter({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  if (options.length === 0) return null;
  const toggle = (v: string) => {
    const next = new Set(selected);
    if (next.has(v)) next.delete(v); else next.add(v);
    onChange(next);
  };
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0">{label}</span>
      {options.map((o) => (
        <button key={o} onClick={() => toggle(o)}
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
            selected.has(o) ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/40"
          }`}>{o}</button>
      ))}
    </div>
  );
}

export default function Admin() {
  const { data: loadedControls = [], isLoading } = useControls();
  const [controls, setControls] = useState<Control[] | null>(null);
  const [search, setSearch] = useState("");
  const [activeControl, setActiveControl] = useState<Control | null>(null);
  const [dirty, setDirty] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [lifecycleFilter, setLifecycleFilter] = useState<Set<string>>(new Set());
  const [gateFilter, setGateFilter] = useState<Set<string>>(new Set());
  const [aiModalityFilter, setAiModalityFilter] = useState<Set<string>>(new Set());

  const allControls = controls ?? loadedControls;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadCSV = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = parseControlsCSV(text);
        if (parsed.length === 0) { toast.error("CSV contained no valid controls"); return; }
        setControls(parsed);
        setDirty(true);
        toast.success(`Loaded ${parsed.length} controls from CSV`);
      } catch { toast.error("Failed to parse CSV"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const gateTypes = useMemo(() => {
    const set = new Set<string>();
    allControls.forEach(c => { if (c.gateType) set.add(c.gateType); });
    return Array.from(set).sort();
  }, [allControls]);

  const activeFilterCount = [lifecycleFilter, gateFilter, aiModalityFilter].reduce((n, s) => n + s.size, 0);
  const clearAllFilters = () => { setLifecycleFilter(new Set()); setGateFilter(new Set()); setAiModalityFilter(new Set()); };

  const filteredControls = useMemo(() => {
    return allControls.filter((c) => {
      if (lifecycleFilter.size && !lifecycleFilter.has(c.lifecycleTrigger)) return false;
      if (gateFilter.size && !gateFilter.has(c.gateType)) return false;
      if (aiModalityFilter.size) {
        const match = AI_MODALITIES.some(m => aiModalityFilter.has(m.label) && c[m.key] === "Yes");
        if (!match) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return c.controlId.toLowerCase().includes(q) || c.safeguardTitle.toLowerCase().includes(q) || c.customerObjective.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allControls, search, lifecycleFilter, gateFilter, aiModalityFilter]);

  const grid = useMemo(() => {
    const map: Record<string, Record<string, Control[]>> = {};
    for (const p of PILLARS) {
      map[p.id] = {};
      for (const ig of IG_LEVELS) {
        map[p.id][ig] = filteredControls.filter(c => c.controlId.startsWith(p.id) && c.ig === ig);
      }
    }
    return map;
  }, [filteredControls]);

  const handleSave = useCallback((updated: Control) => {
    const existing = allControls.find(c => c.controlId === updated.controlId);
    const newList = existing
      ? allControls.map(c => c.controlId === updated.controlId ? updated : c)
      : [...allControls, updated];
    setControls(newList);
    setActiveControl(null);
    setDirty(true);
  }, [allControls]);

  const handleDelete = useCallback((id: string) => {
    setControls(allControls.filter(c => c.controlId !== id));
    setActiveControl(null);
    setDirty(true);
  }, [allControls]);

  const handleNew = () => {
    setActiveControl({ ...EMPTY_CONTROL });
  };

  const downloadCSV = useCallback(() => {
    const rows = allControls.map(controlToCSVRow);
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "controls.csv"; a.click();
    URL.revokeObjectURL(url);
    setDirty(false);
  }, [allControls]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading framework…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-1.5 flex items-center gap-3 shadow-sm min-w-[1200px]">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-sm font-serif font-semibold mr-3 hidden sm:block">Admin — Controls Editor</h1>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input type="text" placeholder="Search controls…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
        </div>

        <button onClick={() => setShowFilters(v => !v)}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors active:scale-95 ${
            showFilters || activeFilterCount > 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"
          }`}>
          Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
        </button>

        {activeFilterCount > 0 && (
          <button onClick={clearAllFilters} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
            <X className="w-3 h-3" /> Clear
          </button>
        )}

        <button onClick={handleNew}
          className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-primary bg-primary text-primary-foreground hover:bg-primary/90 transition-colors active:scale-95 ml-auto flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> New Control
        </button>

        <button onClick={downloadCSV}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors active:scale-95 flex items-center gap-1 ${
            dirty ? "border-accent bg-accent text-accent-foreground animate-pulse" : "border-border bg-card hover:bg-muted"
          }`}>
          <Download className="w-3.5 h-3.5" />
          {dirty ? "Save CSV ⬇" : "Download CSV"}
        </button>
      </header>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-card border-b border-border px-4 py-3 space-y-2 min-w-[1200px] shadow-sm">
          <ChipFilter label="Lifecycle" options={[...LIFECYCLE_TRIGGERS]} selected={lifecycleFilter} onChange={setLifecycleFilter} />
          <ChipFilter label="Gate Type" options={gateTypes} selected={gateFilter} onChange={setGateFilter} />
          <ChipFilter label="AI Type" options={AI_MODALITIES.map(m => m.label)} selected={aiModalityFilter} onChange={setAiModalityFilter} />
        </div>
      )}

      {/* Kanban Board */}
      <div className="min-w-[1200px]">
        {/* Pillar Headers */}
        <div className="sticky top-[37px] z-20 bg-background border-b border-border grid grid-cols-[100px_repeat(7,1fr)]">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-end" />
          {PILLARS.map((p) => (
            <div key={p.id} className="px-2 py-1.5 border-l border-border">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: `hsl(${PILLAR_COLORS[p.id]})` }} />
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
              <div className="px-3 py-3 flex flex-col justify-start sticky left-0 z-10" style={{ background: `hsl(var(${igBgVar}))` }}>
                <span className="text-xs font-bold" style={{ color: `hsl(var(${igColorVar}))` }}>{ig}</span>
                <span className="text-[9px] text-muted-foreground leading-tight mt-0.5">{meta.sub}</span>
              </div>
              {PILLARS.map((pillar) => {
                const items = grid[pillar.id]?.[ig] || [];
                return (
                  <div key={`${pillar.id}-${ig}`} className="border-l border-border px-1.5 py-1.5 space-y-1 bg-card/50">
                    {items.map((c) => (
                      <button key={c.controlId} onClick={() => setActiveControl(c)}
                        className="w-full rounded-md border text-[11px] transition-all text-left px-1.5 py-1.5 hover:shadow-md active:scale-[0.97] cursor-pointer bg-card border-border hover:border-primary/40">
                        <div className="flex items-start gap-1.5">
                          <div className="flex-1 min-w-0">
                            <span className="leading-tight block">{c.safeguardTitle}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[9px] font-mono text-muted-foreground">{c.controlId}</span>
                              <span className={`text-[8px] font-semibold px-1 py-0.5 rounded ${
                                c.gateType === "Baseline Gate" ? "bg-destructive/15 text-destructive"
                                  : c.gateType === "Scale Gate" ? "bg-status-yellow/20 text-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {c.gateType === "Baseline Gate" ? "BASE" : c.gateType === "Scale Gate" ? "SCALE" : c.gateType === "Advanced Score" ? "ADV" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
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

      {/* Detail Panel with edit mode */}
      {activeControl && (
        <ControlDetailPanel
          control={activeControl}
          onClose={() => setActiveControl(null)}
          editable
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
