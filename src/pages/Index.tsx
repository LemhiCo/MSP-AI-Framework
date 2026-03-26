import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, Download, X, Heart, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import ControlDetailPanel from "@/components/ControlDetailPanel";
import { useControls } from "@/hooks/use-framework-data";
import { PILLARS, IG_LEVELS, LIFECYCLE_TRIGGERS, AI_MODALITIES, type Control } from "@/lib/csv-loader";
import * as XLSX from "xlsx";
import WaitlistGate, { useWaitlistGate } from "@/components/WaitlistGate";
import ContributorsTicker from "@/components/ContributorsTicker";

const IG_META: Record<string, { label: string; sub: string }> = {
  IG1: { label: "IG1 — Essential", sub: "Minimum safe floor" },
  IG2: { label: "IG2 — Managed", sub: "Repeatable practice" },
  IG3: { label: "IG3 — Advanced", sub: "Mature & regulated" },
};

const PILLAR_COLORS: Record<string, string> = {
  STR: "90 37% 28%",
  GOV: "280 30% 40%",
  TEC: "168 40% 30%",
  CPL: "220 55% 50%",
  PRC: "25 70% 46%",
  DAT: "340 45% 42%",
  OBS: "200 50% 36%",
  DEP: "46 60% 38%",
};

function useUniqueValues(controls: Control[], key: keyof Control) {
  return useMemo(() => {
    const set = new Set<string>();
    controls.forEach((c) => { if (c[key]) set.add(c[key]); });
    return Array.from(set).sort();
  }, [controls, key]);
}

function ChipFilter({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: Set<string>;
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
        <button
          key={o}
          onClick={() => toggle(o)}
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
            selected.has(o)
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/40"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

const Index = () => {
  const { data: controls = [], isLoading } = useControls();
  const { signedUp, markSignedUp } = useWaitlistGate();
  const [search, setSearch] = useState("");
  const [activeControl, setActiveControl] = useState<Control | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCopilot, setShowCopilot] = useState(true);
  const [showContributeTooltip, setShowContributeTooltip] = useState(false);

  useEffect(() => {
    const key = "lemhi-contribute-tooltip-seen";
    if (!localStorage.getItem(key)) {
      const timer = setTimeout(() => setShowContributeTooltip(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const visiblePillars = useMemo(() =>
    showCopilot ? PILLARS : PILLARS.filter(p => !("optional" in p)),
  [showCopilot]);

  // Filter state
  const [lifecycleFilter, setLifecycleFilter] = useState<Set<string>>(new Set());
  const [gateFilter, setGateFilter] = useState<Set<string>>(new Set());
  const [aiModalityFilter, setAiModalityFilter] = useState<Set<string>>(new Set());

  // Derive unique values
  const gateTypes = useUniqueValues(controls, "gateType");

  const activeFilterCount = [lifecycleFilter, gateFilter, aiModalityFilter]
    .reduce((n, s) => n + s.size, 0);

  const clearAllFilters = () => {
    setLifecycleFilter(new Set());
    setGateFilter(new Set());
    setAiModalityFilter(new Set());
  };

  const filteredControls = useMemo(() => {
    const hiddenPillarIds = new Set<string>(PILLARS.filter(p => "optional" in p && !showCopilot).map(p => p.id));
    return controls.filter((c) => {
      const pillarId = c.controlId.split("-")[0];
      if (hiddenPillarIds.has(pillarId)) return false;
      if (lifecycleFilter.size && !lifecycleFilter.has(c.lifecycleTrigger)) return false;
      if (gateFilter.size && !gateFilter.has(c.gateType)) return false;
      if (aiModalityFilter.size) {
        const match = AI_MODALITIES.some(
          (m) => aiModalityFilter.has(m.label) && c[m.key] === "Yes"
        );
        if (!match) return false;
      }
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
  }, [controls, search, lifecycleFilter, gateFilter, aiModalityFilter, showCopilot]);

  const grid = useMemo(() => {
    const map: Record<string, Record<string, Control[]>> = {};
    for (const p of visiblePillars) {
      map[p.id] = {};
      for (const ig of IG_LEVELS) {
        map[p.id][ig] = filteredControls.filter(
          (c) => c.controlId.startsWith(p.id) && c.ig === ig
        );
      }
    }
    return map;
  }, [filteredControls, visiblePillars]);

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
      "Raw Weight": c.rawWeight,
      "Gate Type": c.gateType,
      "Minimum Status to Pass": c.minStatusToPass,
      "Minimum Evidence to Pass": c.minEvidenceToPass,
      "Fail Condition": c.failCondition,
      "Why it Matters": c.whyItMatters,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Controls");
    XLSX.writeFile(wb, "ai-enablement-framework.xlsx");
  }, [controls]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading framework…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Waitlist gate */}
      {!signedUp && <WaitlistGate onComplete={markSignedUp} />}

      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-1.5 flex items-center gap-3 shadow-sm min-w-[1200px]">
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

        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors active:scale-95 ${
            showFilters || activeFilterCount > 0
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border hover:bg-muted"
          }`}
        >
          Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}

        <button
          onClick={() => setShowCopilot(v => !v)}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors active:scale-95 ${
            showCopilot ? "bg-[hsl(220_55%_50%)] text-white border-[hsl(220_55%_50%)]" : "bg-card border-border hover:bg-muted"
          }`}
          title="Toggle Copilot Readiness pillar"
        >
          {showCopilot ? "Copilot ✓" : "Copilot"}
        </button>

        <button
          onClick={handleDownloadXlsx}
          className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-border bg-card hover:bg-muted transition-colors active:scale-95 ml-auto"
          title="Download XLSX"
        >
          <Download className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
          XLSX
        </button>

        <div className="relative">
          <Link
            to="/admin"
            className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-border bg-card hover:bg-muted transition-colors active:scale-95 flex items-center gap-1"
            onClick={() => {
              setShowContributeTooltip(false);
              localStorage.setItem("lemhi-contribute-tooltip-seen", "true");
            }}
          >
            <Heart className="w-3.5 h-3.5 text-destructive" /> Contribute
          </Link>

          {showContributeTooltip && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl p-4 z-50 animate-fade-up" style={{ animationDuration: "300ms" }}>
              <div className="absolute -top-1.5 right-4 w-3 h-3 bg-card border-l border-t border-border rotate-45" />
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">🤝</span>
                <div>
                  <p className="text-sm font-semibold">This is a community project!</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    The AI Controls Framework is open source. You can review, improve, and suggest changes to help MSPs and advisors worldwide.
                  </p>
                </div>
              </div>
              <a
                href="https://github.com/LemhiCo/MSP-AI-Framework/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-2"
              >
                <ExternalLink className="w-3 h-3" /> View on GitHub
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContributeTooltip(false);
                  localStorage.setItem("lemhi-contribute-tooltip-seen", "true");
                }}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-card border-b border-border px-4 py-3 space-y-2 min-w-[1200px] shadow-sm">
          <ChipFilter label="Lifecycle" options={[...LIFECYCLE_TRIGGERS]} selected={lifecycleFilter} onChange={setLifecycleFilter} />
          <ChipFilter label="Gate Type" options={gateTypes} selected={gateFilter} onChange={setGateFilter} />
          <ChipFilter label="AI Type" options={AI_MODALITIES.map((m) => m.label)} selected={aiModalityFilter} onChange={setAiModalityFilter} />
        </div>
      )}

      {/* Kanban Board */}
      <div className="min-w-[1200px]">
        {/* Pillar Headers */}
        <div className="sticky top-[37px] z-20 bg-background border-b border-border grid" style={{ gridTemplateColumns: `100px repeat(${visiblePillars.length},1fr)` }}>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-end" />
          {visiblePillars.map((p) => (
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
            <div key={ig} className="grid border-b border-border" style={{ gridTemplateColumns: `100px repeat(${visiblePillars.length},1fr)` }}>
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

              {visiblePillars.map((pillar) => {
                const items = grid[pillar.id]?.[ig] || [];
                return (
                  <div key={`${pillar.id}-${ig}`} className="border-l border-border px-1.5 py-1.5 space-y-1 bg-card/50">
                    {items.map((c) => (
                      <button
                        key={c.controlId}
                        onClick={() => setActiveControl(c)}
                        className="w-full rounded-md border text-[11px] transition-all text-left px-1.5 py-1.5 hover:shadow-md active:scale-[0.97] cursor-pointer bg-card border-border hover:border-primary/40"
                      >
                        <div className="flex items-start gap-1.5">
                          <div className="flex-1 min-w-0">
                            <span className="leading-tight block">
                              {c.safeguardTitle}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[9px] font-mono text-muted-foreground">
                                {c.controlId}
                              </span>
                              <span className={`text-[8px] font-semibold px-1 py-0.5 rounded ${
                                c.gateType === "Baseline Gate"
                                  ? "bg-destructive/15 text-destructive"
                                  : c.gateType === "Scale Gate"
                                  ? "bg-status-yellow/20 text-foreground"
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

      {/* Contributors */}
      <ContributorsTicker />

      {/* Detail Panel (slide-over) */}
      {activeControl && (
        <ControlDetailPanel control={activeControl} onClose={() => setActiveControl(null)} />
      )}
    </div>
  );
};

export default Index;
