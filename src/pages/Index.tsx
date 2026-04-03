import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, Download, X, Heart, ExternalLink, ArrowRight, SlidersHorizontal } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ControlDetailPanel from "@/components/ControlDetailPanel";
import MobileControlList from "@/components/MobileControlList";
import MobileDetailSheet from "@/components/MobileDetailSheet";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import { useControls } from "@/hooks/use-framework-data";
import { CONTENT_AREAS, IG_LEVELS, IG_META, LIFECYCLE_TRIGGERS, getContentAreaPrefix, type Control } from "@/lib/csv-loader";
import * as XLSX from "xlsx";
import WaitlistGate, { useWaitlistGate } from "@/components/WaitlistGate";
import ContributorsTicker from "@/components/ContributorsTicker";
import MarkdownModal from "@/components/MarkdownModal";
import { useIsMobile } from "@/hooks/use-mobile";

const CA_COLORS: Record<string, string> = {
  STR: "340 65% 47%",
  SKL: "0 70% 50%",
  GOV: "25 80% 50%",
  TEC: "200 50% 42%",
  CPL: "168 40% 35%",
  PRC: "45 80% 45%",
  DAT: "280 40% 45%",
  OBS: "210 60% 50%",
  DEP: "150 50% 40%",
};

const IG_COLORS: Record<string, { text: string; bg: string }> = {
  IG1: { text: "0 70% 50%", bg: "0 70% 97%" },
  IG2: { text: "25 80% 50%", bg: "25 80% 97%" },
  IG3: { text: "200 50% 42%", bg: "200 50% 96%" },
  IG4: { text: "168 40% 35%", bg: "168 40% 96%" },
  IG5: { text: "280 40% 45%", bg: "280 40% 96%" },
};

function useUniqueValues(controls: Control[], key: keyof Control) {
  return useMemo(() => {
    const set = new Set<string>();
    controls.forEach((c) => { if (c[key]) set.add(c[key]); });
    return Array.from(set).sort();
  }, [controls, key]);
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
            selected.has(o) ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40"
          }`}>{o}</button>
      ))}
    </div>
  );
}

const Index = () => {
  const isMobile = useIsMobile();
  const { data: controls = [], isLoading } = useControls();
  const { signedUp, markSignedUp } = useWaitlistGate();
  const [search, setSearch] = useState("");
  const [activeControl, setActiveControl] = useState<Control | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showContributeTooltip, setShowContributeTooltip] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showMagicModal, setShowMagicModal] = useState(false);

  useEffect(() => {
    const magicKey = "lemhi-magic-modal-seen";
    if (signedUp && !localStorage.getItem(magicKey)) {
      localStorage.setItem(magicKey, "true");
      setShowMagicModal(true);
    }
  }, [signedUp]);

  useEffect(() => {
    const contribKey = "lemhi-contribute-tooltip-seen";
    if (!localStorage.getItem(contribKey)) {
      const t = setTimeout(() => setShowContributeTooltip(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  // Filter state
  const [lifecycleFilter, setLifecycleFilter] = useState<Set<string>>(new Set());
  const [firstRequiredFilter, setFirstRequiredFilter] = useState<Set<string>>(new Set());
  const [contentAreaFilter, setContentAreaFilter] = useState<Set<string>>(new Set());

  const firstRequiredOptions = useUniqueValues(controls, "firstRequiredWhen");

  const activeFilterCount = [lifecycleFilter, firstRequiredFilter, contentAreaFilter].reduce((n, s) => n + s.size, 0);

  const clearAllFilters = () => {
    setLifecycleFilter(new Set());
    setFirstRequiredFilter(new Set());
    setContentAreaFilter(new Set());
  };

  const filteredControls = useMemo(() => {
    return controls.filter((c) => {
      if (lifecycleFilter.size && !lifecycleFilter.has(c.lifecycleTrigger)) return false;
      if (firstRequiredFilter.size && !firstRequiredFilter.has(c.firstRequiredWhen)) return false;
      if (contentAreaFilter.size && !contentAreaFilter.has(getContentAreaPrefix(c))) return false;
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
  }, [controls, search, lifecycleFilter, firstRequiredFilter]);

  const grid = useMemo(() => {
    const map: Record<string, Record<string, Control[]>> = {};
    for (const ca of CONTENT_AREAS) {
      map[ca.id] = {};
      for (const ig of IG_LEVELS) {
        map[ca.id][ig] = filteredControls.filter(
          (c) => getContentAreaPrefix(c) === ca.id && c.implementationGuard === ig
        );
      }
    }
    return map;
  }, [filteredControls]);

  const handleDownloadXlsx = useCallback(() => {
    const rows = controls.map((c) => ({
      "Implementation Guard": c.implementationGuard,
      "Control ID": c.controlId,
      "Content Area": c.contentArea,
      "Safeguard Title": c.safeguardTitle,
      "Customer Objective": c.customerObjective,
      "Detailed Requirement": c.detailedRequirement,
      "Lifecycle Trigger": c.lifecycleTrigger,
      "Cadence": c.cadence,
      "Primary Stakeholder": c.primaryStakeholder,
      "Evidence of Completion": c.evidenceOfCompletion,
      "Minimum Status to Pass": c.minStatusToPass,
      "Minimum Evidence to Pass": c.minEvidenceToPass,
      "Fail Condition": c.failCondition,
      "Why it Matters": c.whyItMatters,
      "Who Cares Most (Customer)": c.whoCaresMost,
      "First Required When": c.firstRequiredWhen,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Controls");
    XLSX.writeFile(wb, "magic-framework-v3.xlsx");
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
      {!signedUp && <WaitlistGate onComplete={() => { markSignedUp(); setShowMagicModal(true); }} />}

      {isMobile ? (
        <>
          <header className="sticky top-0 z-30 bg-card border-b border-border px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-serif font-semibold truncate flex-1">MAGIC</h1>
              <button onClick={() => setShowMobileFilters(true)}
                className={`p-1.5 rounded-md border transition-colors ${activeFilterCount > 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setShowContributeTooltip(false); localStorage.setItem("lemhi-contribute-tooltip-seen", "true"); setShowContributeModal(true); }}
                className="p-1.5 rounded-md border border-border bg-card">
                <Heart className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Search controls…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-muted-foreground">{activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active</span>
                <button onClick={clearAllFilters} className="text-[10px] text-primary flex items-center gap-0.5"><X className="w-3 h-3" /> Clear</button>
              </div>
            )}
          </header>

          <MobileControlList controls={filteredControls} onSelect={setActiveControl} />

          <MobileFilterSheet
            open={showMobileFilters}
            onClose={() => setShowMobileFilters(false)}
            lifecycleFilter={lifecycleFilter}
            setLifecycleFilter={setLifecycleFilter}
            firstRequiredFilter={firstRequiredFilter}
            setFirstRequiredFilter={setFirstRequiredFilter}
            firstRequiredOptions={firstRequiredOptions}
            contentAreaFilter={contentAreaFilter}
            setContentAreaFilter={setContentAreaFilter}
            activeCount={activeFilterCount}
            onClear={clearAllFilters}
          />

          {activeControl && <MobileDetailSheet control={activeControl} onClose={() => setActiveControl(null)} />}
        </>
      ) : (
        <>
          <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-1.5 flex items-center gap-3 shadow-sm min-w-[1200px]">
            <h1 className="text-sm font-serif font-semibold mr-3 hidden sm:block">MAGIC — Managed AI Governance & Implementation Controls</h1>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Search controls…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
            </div>

            <button onClick={() => setShowFilters((v) => !v)}
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

            <button onClick={handleDownloadXlsx}
              className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-border bg-card hover:bg-muted transition-colors active:scale-95 ml-auto" title="Download XLSX">
              <Download className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />XLSX
            </button>

            <div className="relative">
              <button onClick={() => { setShowContributeTooltip(false); localStorage.setItem("lemhi-contribute-tooltip-seen", "true"); setShowContributeModal(true); }}
                className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-border bg-card hover:bg-muted transition-colors active:scale-95 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-destructive" /> Contribute
              </button>

              {showContributeTooltip && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl p-4 z-50 animate-fade-up" style={{ animationDuration: "300ms" }}>
                  <div className="absolute -top-1.5 right-4 w-3 h-3 bg-card border-l border-t border-border rotate-45" />
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-lg">🤝</span>
                    <div>
                      <p className="text-sm font-semibold">This is a community project!</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        The MAGIC Framework is open source. You can review, improve, and suggest changes to help MSPs and advisors worldwide.
                      </p>
                    </div>
                  </div>
                  <a href="https://github.com/LemhiCo/MSP-AI-Framework/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-2">
                    <ExternalLink className="w-3 h-3" /> View on GitHub
                  </a>
                  <button onClick={(e) => { e.stopPropagation(); setShowContributeTooltip(false); localStorage.setItem("lemhi-contribute-tooltip-seen", "true"); }}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-card border-b border-border px-4 py-3 space-y-2 min-w-[1200px] shadow-sm">
              <ChipFilter label="Content Area" options={CONTENT_AREAS.map(ca => ca.id)} selected={contentAreaFilter} onChange={setContentAreaFilter} />
              <ChipFilter label="Lifecycle" options={[...LIFECYCLE_TRIGGERS]} selected={lifecycleFilter} onChange={setLifecycleFilter} />
              <ChipFilter label="First Required" options={firstRequiredOptions} selected={firstRequiredFilter} onChange={setFirstRequiredFilter} />
            </div>
          )}

          {/* Kanban Board */}
          <div className="min-w-[1200px]">
            <div className="sticky top-[37px] z-20 bg-background border-b border-border grid" style={{ gridTemplateColumns: `100px repeat(${CONTENT_AREAS.length},1fr)` }}>
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-end" />
              {CONTENT_AREAS.map((ca) => (
                <div key={ca.id} className="px-2 py-1.5 border-l border-border">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: `hsl(${CA_COLORS[ca.id] || "0 0% 50%"})` }} />
                    <span className="text-xs font-bold truncate">{ca.id}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">{ca.name}</p>
                </div>
              ))}
            </div>

            {IG_LEVELS.map((ig) => {
              const meta = IG_META[ig];
              const colors = IG_COLORS[ig] || { text: "0 0% 50%", bg: "0 0% 97%" };
              return (
                <div key={ig} className="grid border-b border-border" style={{ gridTemplateColumns: `100px repeat(${CONTENT_AREAS.length},1fr)` }}>
                  <div className="px-3 py-3 flex flex-col justify-start sticky left-0 z-10" style={{ background: `hsl(${colors.bg})` }}>
                    <span className="text-xs font-bold" style={{ color: `hsl(${colors.text})` }}>{ig}</span>
                    <span className="text-[9px] text-muted-foreground leading-tight mt-0.5">{meta?.sub}</span>
                  </div>
                  {CONTENT_AREAS.map((ca) => {
                    const items = grid[ca.id]?.[ig] || [];
                    return (
                      <div key={`${ca.id}-${ig}`} className="border-l border-border px-1.5 py-1.5 space-y-1 bg-card/50">
                        {items.map((c) => (
                          <button key={c.controlId} onClick={() => setActiveControl(c)}
                            className="w-full rounded-md border text-[11px] transition-all text-left px-1.5 py-1.5 hover:shadow-md active:scale-[0.97] cursor-pointer bg-card border-border hover:border-primary/40">
                            <div className="flex items-start gap-1.5">
                              <div className="flex-1 min-w-0">
                                <span className="leading-tight block">{c.safeguardTitle}</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-[9px] font-mono text-muted-foreground">{c.controlId}</span>
                                  {c.firstRequiredWhen && (
                                    <span className="text-[8px] font-medium px-1 py-0.5 rounded bg-accent/30 text-accent-foreground">
                                      {c.firstRequiredWhen}
                                    </span>
                                  )}
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

          {activeControl && <ControlDetailPanel control={activeControl} onClose={() => setActiveControl(null)} />}
        </>
      )}

      <ContributorsTicker />

      <MarkdownModal src="/data/contributor.md" open={showContributeModal} onClose={() => setShowContributeModal(false)} icon="🤝" title="Contributing to MAGIC"
        cta={{ label: "Start Contributing", to: "/admin" }} />

      <MarkdownModal src="/data/magic.md" open={showMagicModal} onClose={() => setShowMagicModal(false)} icon="✦" title="MAGIC Framework"
        cta={{ label: "View on GitHub", href: "https://github.com/LemhiCo/MSP-AI-Framework/" }} />
    </div>
  );
};

export default Index;
