import { useState, useMemo, useCallback } from "react";
import { Search, Plus, Download, ArrowLeft, X, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { useControls } from "@/hooks/use-framework-data";
import { PILLARS, IG_LEVELS, AI_MODALITIES, LIFECYCLE_TRIGGERS, type Control } from "@/lib/csv-loader";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import ControlDetailPanel from "@/components/ControlDetailPanel";
import { toast } from "sonner";

const EMPTY_CONTROL: Control = {
  controlId: "", pillar: "", ig: "", safeguardTitle: "", customerObjective: "", eli5: "",
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
  CPL: "220 55% 50%",
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
  const [isNewCard, setIsNewCard] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [lifecycleFilter, setLifecycleFilter] = useState<Set<string>>(new Set());
  const [gateFilter, setGateFilter] = useState<Set<string>>(new Set());
  const [aiModalityFilter, setAiModalityFilter] = useState<Set<string>>(new Set());
  const [showCopilot, setShowCopilot] = useState(true);
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set());
  const [showPrButton, setShowPrButton] = useState(false);
  const [originalControls, setOriginalControls] = useState<Map<string, Control>>(new Map());
  const [csvHash, setCsvHash] = useState("");

  const allControls = controls ?? loadedControls;
  const visiblePillars = useMemo(() =>
    showCopilot ? PILLARS : PILLARS.filter(p => !("optional" in p)),
  [showCopilot]);

  // Snapshot original controls for diff tracking
  useMemo(() => {
    if (loadedControls.length > 0 && originalControls.size === 0) {
      const map = new Map<string, Control>();
      loadedControls.forEach(c => map.set(c.controlId, { ...c }));
      setOriginalControls(map);
    }
  }, [loadedControls]);

  const gateTypes = useMemo(() => {
    const set = new Set<string>();
    allControls.forEach(c => { if (c.gateType) set.add(c.gateType); });
    return Array.from(set).sort();
  }, [allControls]);

  const activeFilterCount = [lifecycleFilter, gateFilter, aiModalityFilter].reduce((n, s) => n + s.size, 0);
  const clearAllFilters = () => { setLifecycleFilter(new Set()); setGateFilter(new Set()); setAiModalityFilter(new Set()); };

  const filteredControls = useMemo(() => {
    const hiddenPillarIds = new Set<string>(PILLARS.filter(p => "optional" in p && !showCopilot).map(p => p.id));
    return allControls.filter((c) => {
      const pillarId = c.controlId.split("-")[0];
      if (hiddenPillarIds.has(pillarId)) return false;
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
  }, [allControls, search, lifecycleFilter, gateFilter, aiModalityFilter, showCopilot]);

  const grid = useMemo(() => {
    const map: Record<string, Record<string, Control[]>> = {};
    for (const p of visiblePillars) {
      map[p.id] = {};
      for (const ig of IG_LEVELS) {
        map[p.id][ig] = filteredControls.filter(c => c.controlId.startsWith(p.id) && c.ig === ig);
      }
    }
    return map;
  }, [filteredControls, visiblePillars]);

  // --- Change tracking ---
  const trackChange = useCallback((id: string) => {
    setChangedIds(prev => new Set(prev).add(id));
  }, []);

  // --- Drag & Drop ---
  const [dragControlId, setDragControlId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ pillar: string; ig: string; index: number } | null>(null);

  const renumberCell = (list: Control[], pillar: string, ig: string): Control[] => {
    const inCell = list
      .filter(c => c.controlId.startsWith(pillar) && c.ig === ig)
      .sort((a, b) => a.controlId.localeCompare(b.controlId));
    const rest = list.filter(c => !(c.controlId.startsWith(pillar) && c.ig === ig));
    const renumbered = inCell.map((c, i) => ({
      ...c,
      controlId: `${pillar}-${ig}-${String(i + 1).padStart(2, "0")}`,
    }));
    return [...rest, ...renumbered];
  };

  const handleDrop = useCallback((targetPillar: string, targetIg: string, targetIndex: number) => {
    if (!dragControlId) return;
    const draggedControl = allControls.find(c => c.controlId === dragControlId);
    if (!draggedControl) return;

    const sourcePillar = draggedControl.controlId.split("-")[0];
    const sourceIg = draggedControl.ig;

    let newList = allControls.filter(c => c.controlId !== dragControlId);
    newList = renumberCell(newList, sourcePillar, sourceIg);

    const targetItems = newList
      .filter(c => c.controlId.startsWith(targetPillar) && c.ig === targetIg)
      .sort((a, b) => a.controlId.localeCompare(b.controlId));
    const others = newList.filter(c => !(c.controlId.startsWith(targetPillar) && c.ig === targetIg));

    const updatedDragged = { ...draggedControl, pillar: targetPillar, ig: targetIg, controlId: "" };
    targetItems.splice(Math.min(targetIndex, targetItems.length), 0, updatedDragged);

    const renumberedTarget = targetItems.map((c, i) => ({
      ...c,
      controlId: `${targetPillar}-${targetIg}-${String(i + 1).padStart(2, "0")}`,
    }));

    setControls([...others, ...renumberedTarget]);
    setDirty(true);
    setDragControlId(null);
    setDropTarget(null);
    trackChange(dragControlId);
    toast.success(`Moved to ${targetPillar}-${targetIg}. IDs renumbered.`);
  }, [dragControlId, allControls, trackChange]);

  const swapOrder = useCallback((controlId: string, direction: -1 | 1) => {
    const control = allControls.find(c => c.controlId === controlId);
    if (!control) return;
    const pillar = control.controlId.split("-")[0];
    const ig = control.ig;
    const cellItems = allControls
      .filter(c => c.controlId.startsWith(pillar + "-") && c.ig === ig)
      .sort((a, b) => a.controlId.localeCompare(b.controlId));
    const idx = cellItems.findIndex(c => c.controlId === controlId);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= cellItems.length) return;
    [cellItems[idx], cellItems[swapIdx]] = [cellItems[swapIdx], cellItems[idx]];
    const renumbered = cellItems.map((c, i) => ({
      ...c,
      controlId: `${pillar}-${ig}-${String(i + 1).padStart(2, "0")}`,
    }));
    const others = allControls.filter(c => !(c.controlId.startsWith(pillar + "-") && c.ig === ig));
    setControls([...others, ...renumbered]);
    setDirty(true);
    trackChange(controlId);
  }, [allControls, trackChange]);

  const handleSave = useCallback((updated: Control) => {
    const existing = allControls.find(c => c.controlId === updated.controlId);
    const newList = existing
      ? allControls.map(c => c.controlId === updated.controlId ? updated : c)
      : [...allControls, updated];
    setControls(newList);
    setActiveControl(null);
    setDirty(true);
    trackChange(updated.controlId);
  }, [allControls, trackChange]);

  const handleDelete = useCallback((id: string) => {
    setControls(allControls.filter(c => c.controlId !== id));
    setActiveControl(null);
    setDirty(true);
    trackChange(id + " (deleted)");
  }, [allControls, trackChange]);

  const handleNew = () => {
    setIsNewCard(true);
    setActiveControl({ ...EMPTY_CONTROL });
  };

  const handleNewInCell = (pillarId: string, ig: string) => {
    const cellItems = allControls.filter(c => c.controlId.startsWith(pillarId + "-") && c.ig === ig);
    const nextNum = String(cellItems.length + 1).padStart(2, "0");
    const pillarObj = PILLARS.find(p => p.id === pillarId);
    setIsNewCard(true);
    setActiveControl({
      ...EMPTY_CONTROL,
      controlId: `${pillarId}-${ig}-${nextNum}`,
      pillar: pillarObj?.name || pillarId,
      ig,
    });
  };

  const generateHash = useCallback((csv: string) => {
    let hash = 0;
    for (let i = 0; i < csv.length; i++) {
      const chr = csv.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).slice(0, 6);
  }, []);

  const buildChangeSummary = useCallback(() => {
    const changedList = Array.from(changedIds);
    const lines: string[] = [];

    for (const id of changedList) {
      if (id.endsWith(" (deleted)")) {
        lines.push(`### ❌ Deleted: \`${id.replace(" (deleted)", "")}\`\n`);
        const orig = originalControls.get(id.replace(" (deleted)", ""));
        if (orig) {
          lines.push(`- **Title:** ${orig.safeguardTitle}`);
          lines.push(`- **Pillar:** ${orig.pillar} / ${orig.ig}\n`);
        }
        continue;
      }

      const current = allControls.find(c => c.controlId === id);
      const orig = originalControls.get(id);

      if (!orig && current) {
        lines.push(`### ➕ Added: \`${id}\``);
        lines.push(`- **Title:** ${current.safeguardTitle}`);
        lines.push(`- **Pillar:** ${current.pillar} / ${current.ig}`);
        lines.push(`- **Customer Objective:** ${current.customerObjective || "_not set_"}`);
        lines.push(`- **Gate Type:** ${current.gateType || "_not set_"}\n`);
      } else if (orig && current) {
        const diffs: string[] = [];
        const fields: { key: keyof Control; label: string }[] = [
          { key: "safeguardTitle", label: "Safeguard Title" },
          { key: "pillar", label: "Pillar" },
          { key: "ig", label: "IG" },
          { key: "customerObjective", label: "Customer Objective" },
          { key: "eli5", label: "ELI5" },
          { key: "detailedRequirement", label: "Detailed Requirement" },
          { key: "lifecycleTrigger", label: "Lifecycle Trigger" },
          { key: "cadence", label: "Cadence" },
          { key: "primaryStakeholder", label: "Primary Stakeholder" },
          { key: "microsoftTool", label: "Microsoft Tool" },
          { key: "genericTooling", label: "Generic Tooling" },
          { key: "evidenceOfCompletion", label: "Evidence of Completion" },
          { key: "gateType", label: "Gate Type" },
          { key: "whyItMatters", label: "Why it Matters" },
        ];
        for (const f of fields) {
          if (orig[f.key] !== current[f.key]) {
            diffs.push(`- **${f.label}:** \`${orig[f.key] || "(empty)"}\` → \`${current[f.key] || "(empty)"}\``);
          }
        }
        if (diffs.length > 0) {
          lines.push(`### ✏️ Modified: \`${id}\` — ${current.safeguardTitle}`);
          lines.push(...diffs);
          lines.push("");
        } else {
          lines.push(`### 🔀 Reordered: \`${id}\` — ${current.safeguardTitle}\n`);
        }
      }
    }
    return lines.join("\n");
  }, [changedIds, allControls, originalControls]);

  const downloadCSV = useCallback(() => {
    const rows = allControls.map(controlToCSVRow);
    const csv = Papa.unparse(rows);
    const hash = generateHash(csv);
    setCsvHash(hash);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `controls-${hash}.csv`; a.click();
    URL.revokeObjectURL(url);
    setDirty(false);
    if (changedIds.size > 0) {
      setShowPrButton(true);
    }
  }, [allControls, changedIds, generateHash]);

  const openIssue = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const changedList = Array.from(changedIds);
    const addedCount = changedList.filter(id => !id.endsWith(" (deleted)") && !originalControls.has(id)).length;
    const editedCount = changedList.filter(id => !id.endsWith(" (deleted)") && originalControls.has(id)).length;
    const deletedCount = changedList.filter(id => id.endsWith(" (deleted)")).length;

    const summaryParts: string[] = [];
    if (addedCount) summaryParts.push(`${addedCount} added`);
    if (editedCount) summaryParts.push(`${editedCount} edited`);
    if (deletedCount) summaryParts.push(`${deletedCount} removed`);

    const title = encodeURIComponent(`[CSV Change]: ${summaryParts.join(", ")} — ${today}`);
    const changeSummary = buildChangeSummary();
    const filename = csvHash ? `controls-${csvHash}.csv` : "controls.csv";
    const body = encodeURIComponent(
      `## Proposed Framework Changes\n\n` +
      `**Date:** ${today}\n` +
      `**Controls affected:** ${changedList.length} (${summaryParts.join(", ")})\n\n` +
      `---\n\n` +
      `## Detailed Changes\n\n${changeSummary}\n` +
      `---\n\n` +
      `## Why this change should be made\n\n_Explain the reasoning, evidence, or implementation context for this recommendation._\n\n` +
      `---\n\n` +
      `📎 **Please attach the recommended CSV below** using "Paste, drop, or click to add files" and upload \`${filename}\`.`
    );
    const url = `https://github.com/LemhiCo/MSP-AI-Framework/issues/new?title=${title}&body=${body}&labels=csv-change,triage`;
    window.open(url, "_blank");
  }, [changedIds, originalControls, buildChangeSummary, csvHash]);
  }, [changedIds]);

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
          className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-primary bg-primary text-primary-foreground hover:bg-primary/90 transition-colors active:scale-95 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> New Control
        </button>

        <button
          onClick={() => setShowCopilot(v => !v)}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors active:scale-95 ${
            showCopilot ? "bg-[hsl(220_55%_50%)] text-white border-[hsl(220_55%_50%)]" : "bg-card border-border hover:bg-muted"
          }`}
          title="Toggle Copilot Readiness pillar"
        >
          {showCopilot ? "Copilot ✓" : "Copilot"}
        </button>


        <button onClick={downloadCSV}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors active:scale-95 flex items-center gap-1 ${
            dirty ? "border-accent bg-accent text-accent-foreground animate-pulse" : "border-border bg-card hover:bg-muted"
          }`}>
          <Download className="w-3.5 h-3.5" />
          {dirty ? "Save CSV ⬇" : "Download CSV"}
        </button>

        {showPrButton && changedIds.size > 0 && (
          <button onClick={openIssue}
            className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-green-600 bg-green-600 text-white hover:bg-green-700 transition-colors active:scale-95 flex items-center gap-1">
            <ExternalLink className="w-3.5 h-3.5" />
            Suggest Change ({changedIds.size})
          </button>
        )}
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
        <div className="sticky top-[37px] z-20 bg-background border-b border-border grid" style={{ gridTemplateColumns: `100px repeat(${visiblePillars.length},1fr)` }}>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-end" />
          {visiblePillars.map((p) => (
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
            <div key={ig} className="grid border-b border-border" style={{ gridTemplateColumns: `100px repeat(${visiblePillars.length},1fr)` }}>
              <div className="px-3 py-3 flex flex-col justify-start sticky left-0 z-10" style={{ background: `hsl(var(${igBgVar}))` }}>
                <span className="text-xs font-bold" style={{ color: `hsl(var(${igColorVar}))` }}>{ig}</span>
                <span className="text-[9px] text-muted-foreground leading-tight mt-0.5">{meta.sub}</span>
              </div>
              {visiblePillars.map((pillar) => {
                const items = grid[pillar.id]?.[ig] || [];
                return (
                  <div key={`${pillar.id}-${ig}`}
                    className={`border-l border-border px-1.5 py-1.5 space-y-1 transition-colors ${
                      dropTarget?.pillar === pillar.id && dropTarget?.ig === ig ? "bg-primary/10" : "bg-card/50"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      const children = Array.from(e.currentTarget.querySelectorAll("[data-card-wrapper]"));
                      let idx = children.length;
                      for (let i = 0; i < children.length; i++) {
                        const cr = children[i].getBoundingClientRect();
                        if (e.clientY < cr.top + cr.height / 2) { idx = i; break; }
                      }
                      setDropTarget({ pillar: pillar.id, ig, index: idx });
                    }}
                    onDragLeave={() => setDropTarget(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(pillar.id, ig, dropTarget?.index ?? items.length);
                    }}
                  >
                    {items.map((c, idx) => (
                      <div key={c.controlId} data-card-wrapper>
                        {dropTarget?.pillar === pillar.id && dropTarget?.ig === ig && dropTarget?.index === idx && (
                          <div className="h-0.5 bg-primary rounded-full my-0.5" />
                        )}
                        <div className={`flex items-stretch gap-0 rounded-md border transition-all bg-card border-border hover:border-primary/40 ${
                          dragControlId === c.controlId ? "opacity-40 scale-95" : ""
                        }`}>
                          <button
                            draggable
                            onDragStart={() => setDragControlId(c.controlId)}
                            onDragEnd={() => { setDragControlId(null); setDropTarget(null); }}
                            onClick={() => { setIsNewCard(false); setActiveControl(c); }}
                            className="flex-1 text-[11px] text-left px-1.5 py-1.5 cursor-grab min-w-0">
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
                          </button>
                          <div className="flex flex-col border-l border-border">
                            <button
                              onClick={(e) => { e.stopPropagation(); swapOrder(c.controlId, -1); }}
                              disabled={idx === 0}
                              className="flex-1 px-0.5 hover:bg-muted disabled:opacity-20 transition-colors"
                              title="Move up">
                              <ChevronUp className="w-3 h-3 text-muted-foreground" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); swapOrder(c.controlId, 1); }}
                              disabled={idx === items.length - 1}
                              className="flex-1 px-0.5 hover:bg-muted disabled:opacity-20 transition-colors"
                              title="Move down">
                              <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {dropTarget?.pillar === pillar.id && dropTarget?.ig === ig && dropTarget?.index === items.length && (
                      <div className="h-0.5 bg-primary rounded-full my-0.5" />
                    )}
                    {items.length === 0 && !dropTarget?.pillar && (
                      <div className="text-[10px] text-muted-foreground italic px-1 py-2">—</div>
                    )}
                    <button
                      onClick={() => handleNewInCell(pillar.id, ig)}
                      className="w-full text-[10px] text-muted-foreground hover:text-primary py-1 flex items-center justify-center gap-0.5 rounded hover:bg-muted/50 transition-colors"
                      title={`Add control to ${pillar.id} ${ig}`}
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
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
          onClose={() => { setActiveControl(null); setIsNewCard(false); }}
          editable
          onSave={handleSave}
          onDelete={handleDelete}
          defaultEditing={isNewCard}
          defaultExpanded={isNewCard}
        />
      )}
    </div>
  );
}
