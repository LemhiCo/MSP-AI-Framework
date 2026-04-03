import { useState, useMemo, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import { Search, Plus, Download, ArrowLeft, X, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { useControls } from "@/hooks/use-framework-data";
import { CONTENT_AREAS, IG_LEVELS, IG_META, LIFECYCLE_TRIGGERS, getContentAreaPrefix, type Control } from "@/lib/csv-loader";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import pako from "pako";
import ControlDetailPanel from "@/components/ControlDetailPanel";
import { toast } from "sonner";
import ContributorsTicker from "@/components/ContributorsTicker";

const EMPTY_CONTROL: Control = {
  controlId: "", implementationGuard: "", contentArea: "",
  safeguardTitle: "", customerObjective: "",
  detailedRequirement: "", lifecycleTrigger: "", cadence: "", primaryStakeholder: "",
  evidenceOfCompletion: "", minStatusToPass: "", minEvidenceToPass: "", failCondition: "",
  whyItMatters: "", whoCaresMost: "", firstRequiredWhen: "",
};

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

function controlToCSVRow(c: Control): Record<string, string> {
  return {
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

function ContributePrompt({ onClose, onOpenIssue, csvHash }: { onClose: () => void; onOpenIssue: () => void; csvHash: string }) {
  const [ack, setAck] = useState(false);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm bg-background/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-2xl p-6 animate-fade-up" style={{ animationDuration: "400ms" }}>
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">🤝</div>
          <h2 className="text-xl font-serif font-semibold">Share Your Improvements</h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Want to contribute your changes back? Open a GitHub Issue and <strong>attach your downloaded CSV</strong>.
          </p>
        </div>
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-xs font-bold text-destructive uppercase tracking-wide">CSV Upload Required</p>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed">
            Automated patches are <strong>not supported</strong>. Your contribution <strong>will not be processed</strong> unless you attach your downloaded CSV file
            {csvHash ? <> (<code className="text-[10px] bg-muted px-1 py-0.5 rounded font-mono">…{csvHash.slice(-6)}</code>)</> : null} to the GitHub Issue.
          </p>
        </div>
        <div className="mb-4 rounded-lg border border-border bg-muted/40 px-4 py-3 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">How it works</p>
          <ol className="text-xs text-foreground/80 space-y-1 leading-relaxed list-decimal list-inside">
            <li>Click below to open a pre-filled GitHub Issue</li>
            <li><strong>Attach your downloaded CSV</strong> to the issue</li>
            <li>Submit — maintainers will review and merge</li>
          </ol>
        </div>
        <label className="flex items-start gap-2.5 mb-4 cursor-pointer select-none group">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-primary shrink-0" />
          <span className="text-xs text-foreground/80 leading-relaxed">
            I understand I <strong>must upload my CSV file</strong> to the GitHub Issue or my contribution cannot be reviewed.
          </span>
        </label>
        <div className="space-y-2">
          <button onClick={onOpenIssue} disabled={!ack}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              ack ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.97]" : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            }`}>
            <ExternalLink className="w-4 h-4" /> Open GitHub Issue
          </button>
          <button onClick={onClose} className="w-full py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            Maybe later
          </button>
        </div>
      </div>
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
  const [firstRequiredFilter, setFirstRequiredFilter] = useState<Set<string>>(new Set());
  const [showIssueButton, setShowIssueButton] = useState(false);
  const [showContributePrompt, setShowContributePrompt] = useState(false);
  const [originalControls, setOriginalControls] = useState<Control[]>([]);
  const [csvHash, setCsvHash] = useState("");

  const allControls = controls ?? loadedControls;

  useMemo(() => {
    if (loadedControls.length > 0 && originalControls.length === 0) {
      setOriginalControls(loadedControls.map(c => ({ ...c })));
    }
  }, [loadedControls]);

  const firstRequiredOptions = useMemo(() => {
    const set = new Set<string>();
    allControls.forEach(c => { if (c.firstRequiredWhen) set.add(c.firstRequiredWhen); });
    return Array.from(set).sort();
  }, [allControls]);

  const activeFilterCount = [lifecycleFilter, firstRequiredFilter].reduce((n, s) => n + s.size, 0);
  const clearAllFilters = () => { setLifecycleFilter(new Set()); setFirstRequiredFilter(new Set()); };

  const filteredControls = useMemo(() => {
    return allControls.filter((c) => {
      if (lifecycleFilter.size && !lifecycleFilter.has(c.lifecycleTrigger)) return false;
      if (firstRequiredFilter.size && !firstRequiredFilter.has(c.firstRequiredWhen)) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.controlId.toLowerCase().includes(q) || c.safeguardTitle.toLowerCase().includes(q) || c.customerObjective.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allControls, search, lifecycleFilter, firstRequiredFilter]);

  // Grid: columns = content areas, rows = IG levels
  const grid = useMemo(() => {
    const map: Record<string, Record<string, Control[]>> = {};
    for (const ca of CONTENT_AREAS) {
      map[ca.id] = {};
      for (const ig of IG_LEVELS) {
        map[ca.id][ig] = filteredControls.filter(c => getContentAreaPrefix(c) === ca.id && c.implementationGuard === ig);
      }
    }
    return map;
  }, [filteredControls]);

  const [dragControlId, setDragControlId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ ca: string; ig: string; index: number } | null>(null);

  const renumberCell = (list: Control[], caId: string, ig: string): Control[] => {
    const inCell = list
      .filter(c => getContentAreaPrefix(c) === caId && c.implementationGuard === ig)
      .sort((a, b) => a.controlId.localeCompare(b.controlId));
    const rest = list.filter(c => !(getContentAreaPrefix(c) === caId && c.implementationGuard === ig));
    const renumbered = inCell.map((c, i) => {
      const prefix = getContentAreaPrefix(c) || "CTL";
      return { ...c, controlId: `${prefix}-${ig}-${String(i + 1).padStart(2, "0")}` };
    });
    return [...rest, ...renumbered];
  };

  const handleDrop = useCallback((targetCaId: string, targetIg: string, targetIndex: number) => {
    if (!dragControlId) return;
    const draggedControl = allControls.find(c => c.controlId === dragControlId);
    if (!draggedControl) return;

    const sourceCaId = getContentAreaPrefix(draggedControl);
    const sourceIg = draggedControl.implementationGuard;

    let newList = allControls.filter(c => c.controlId !== dragControlId);
    newList = renumberCell(newList, sourceCaId, sourceIg);

    const targetItems = newList
      .filter(c => getContentAreaPrefix(c) === targetCaId && c.implementationGuard === targetIg)
      .sort((a, b) => a.controlId.localeCompare(b.controlId));
    const others = newList.filter(c => !(getContentAreaPrefix(c) === targetCaId && c.implementationGuard === targetIg));

    const updatedDragged = {
      ...draggedControl,
      implementationGuard: targetIg,
      controlId: "",
    };
    targetItems.splice(Math.min(targetIndex, targetItems.length), 0, updatedDragged);

    const renumberedTarget = targetItems.map((c, i) => {
      const prefix = getContentAreaPrefix(c) || "CTL";
      return { ...c, controlId: `${prefix}-${targetIg}-${String(i + 1).padStart(2, "0")}` };
    });

    setControls([...others, ...renumberedTarget]);
    setDirty(true);
    setDragControlId(null);
    setDropTarget(null);
    toast.success(`Moved to ${targetCaId}-${targetIg}. IDs renumbered.`);
  }, [dragControlId, allControls]);

  const swapOrder = useCallback((controlId: string, direction: -1 | 1) => {
    const control = allControls.find(c => c.controlId === controlId);
    if (!control) return;
    const caId = getContentAreaPrefix(control);
    const ig = control.implementationGuard;
    const cellItems = allControls
      .filter(c => getContentAreaPrefix(c) === caId && c.implementationGuard === ig)
      .sort((a, b) => a.controlId.localeCompare(b.controlId));
    const idx = cellItems.findIndex(c => c.controlId === controlId);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= cellItems.length) return;
    [cellItems[idx], cellItems[swapIdx]] = [cellItems[swapIdx], cellItems[idx]];
    const renumbered = cellItems.map((c, i) => {
      const prefix = getContentAreaPrefix(c) || "CTL";
      return { ...c, controlId: `${prefix}-${ig}-${String(i + 1).padStart(2, "0")}` };
    });
    const others = allControls.filter(c => !(getContentAreaPrefix(c) === caId && c.implementationGuard === ig));
    setControls([...others, ...renumbered]);
    setDirty(true);
  }, [allControls]);

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
    setIsNewCard(true);
    setActiveControl({ ...EMPTY_CONTROL });
  };

  const handleNewInCell = (caId: string, ig: string) => {
    const cellItems = allControls.filter(c => getContentAreaPrefix(c) === caId && c.implementationGuard === ig);
    const nextNum = String(cellItems.length + 1).padStart(2, "0");
    setIsNewCard(true);
    setActiveControl({
      ...EMPTY_CONTROL,
      controlId: `${caId}-${ig}-${nextNum}`,
      implementationGuard: ig,
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

  const computeDiff = useCallback(() => {
    const diffFields: { key: keyof Control; label: string }[] = [
      { key: "safeguardTitle", label: "Safeguard Title" },
      { key: "customerObjective", label: "Customer Objective" },
      { key: "detailedRequirement", label: "Detailed Requirement" },
      { key: "lifecycleTrigger", label: "Lifecycle Trigger" },
      { key: "cadence", label: "Cadence" },
      { key: "primaryStakeholder", label: "Primary Stakeholder" },
      { key: "evidenceOfCompletion", label: "Evidence of Completion" },
      { key: "whyItMatters", label: "Why it Matters" },
      { key: "contentArea", label: "Content Area" },
    ];

    const added: Control[] = [];
    const deleted: Control[] = [];
    const modified: { control: Control; changes: string[] }[] = [];
    const reordered: { from: string; to: string; title: string }[] = [];

    for (const orig of originalControls) {
      const stillExists = allControls.some(c => c.safeguardTitle === orig.safeguardTitle);
      if (!stillExists) deleted.push(orig);
    }

    for (const curr of allControls) {
      const origByTitle = originalControls.find(c => c.safeguardTitle === curr.safeguardTitle);
      if (!origByTitle) { added.push(curr); continue; }
      const changes: string[] = [];
      for (const f of diffFields) {
        if (f.key === "safeguardTitle") continue;
        if (origByTitle[f.key] !== curr[f.key]) {
          changes.push(`- **${f.label}:** \`${origByTitle[f.key] || "(empty)"}\` → \`${curr[f.key] || "(empty)"}\``);
        }
      }
      if (origByTitle.controlId !== curr.controlId) {
        const origCA = getContentAreaPrefix(origByTitle);
        const currCA = getContentAreaPrefix(curr);
        if (origCA !== currCA || origByTitle.implementationGuard !== curr.implementationGuard) {
          changes.push(`- **Moved:** \`${origByTitle.controlId}\` → \`${curr.controlId}\``);
        } else {
          reordered.push({ from: origByTitle.controlId, to: curr.controlId, title: curr.safeguardTitle });
        }
      }
      if (changes.length > 0) modified.push({ control: curr, changes });
    }

    return { added, deleted, modified, reordered };
  }, [allControls, originalControls]);

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
    const { added, deleted, modified, reordered } = computeDiff();
    if (added.length + deleted.length + modified.length + reordered.length > 0) setShowIssueButton(true);
  }, [allControls, generateHash, computeDiff]);

  const openIssue = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const { added, deleted, modified, reordered } = computeDiff();
    const totalChanges = added.length + deleted.length + modified.length + reordered.length;

    const summaryParts: string[] = [];
    if (added.length) summaryParts.push(`${added.length} added`);
    if (modified.length) summaryParts.push(`${modified.length} edited`);
    if (deleted.length) summaryParts.push(`${deleted.length} removed`);
    if (reordered.length) summaryParts.push(`${reordered.length} reordered`);

    const title = encodeURIComponent(`[CSV Change]: ${summaryParts.join(", ")} — ${today}`);

    const lines: string[] = [];
    for (const c of deleted) lines.push(`### ❌ Deleted: \`${c.controlId}\` — ${c.safeguardTitle}\n`);
    for (const c of added) {
      lines.push(`### ➕ Added: \`${c.controlId}\` — ${c.safeguardTitle}`);
      if (c.customerObjective) lines.push(`- **Customer Objective:** ${c.customerObjective}`);
      lines.push("");
    }
    for (const { control, changes } of modified) {
      lines.push(`### ✏️ Modified: \`${control.controlId}\` — ${control.safeguardTitle}`);
      lines.push(...changes);
      lines.push("");
    }
    if (reordered.length > 0) {
      lines.push(`### 🔀 Reordered`);
      for (const r of reordered) lines.push(`- \`${r.from}\` → \`${r.to}\` — ${r.title}`);
      lines.push("");
    }

    const patches: string[] = [];
    for (const c of deleted) patches.push(`D|${c.controlId}`);
    for (const c of added) {
      const row = controlToCSVRow(c);
      const fields = Object.entries(row).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join("\t");
      patches.push(`A|${c.controlId}|${fields}`);
    }
    for (const { control } of modified) {
      const orig = originalControls.find(o => o.safeguardTitle === control.safeguardTitle);
      if (!orig) continue;
      const origRow = controlToCSVRow(orig);
      const currRow = controlToCSVRow(control);
      const diffs = Object.keys(currRow).filter(k => origRow[k] !== currRow[k]).map(k => `${k}=${currRow[k]}`).join("\t");
      if (diffs) patches.push(`M|${control.controlId}|${diffs}`);
    }
    for (const r of reordered) patches.push(`R|${r.from}|${r.to}`);

    const diffText = patches.join("\n");
    const compressed = pako.deflate(new TextEncoder().encode(diffText));
    const base64Payload = btoa(String.fromCharCode(...compressed));

    const body = encodeURIComponent(
      `## Proposed Framework Changes\n\n**Date:** ${today}\n**Total changes:** ${totalChanges} (${summaryParts.join(", ")})\n\n---\n\n## Detailed Changes\n\n${lines.join("\n")}\n---\n\n## Why this change should be made\n\n_Explain the reasoning._\n\n---\n\n<!-- MSP_PATCH_V2:${base64Payload} -->`
    );
    const url = `https://github.com/LemhiCo/MSP-AI-Framework/issues/new?title=${title}&body=${body}&labels=csv-change,triage`;
    if (url.length > 8000) {
      const strippedBody = encodeURIComponent(
        `## Proposed Framework Changes\n\n**Date:** ${today}\n**Total changes:** ${totalChanges} (${summaryParts.join(", ")})\n\n---\n\n## Detailed Changes\n\n${lines.join("\n")}\n---\n\n## Why this change should be made\n\n_Explain the reasoning._\n\n---\n\n> ⚠️ Patch payload was too large. **Please attach your downloaded CSV file.**`
      );
      setShowContributePrompt(true);
      window.open(`https://github.com/LemhiCo/MSP-AI-Framework/issues/new?title=${title}&body=${strippedBody}&labels=csv-change,triage`, "_blank");
    } else {
      window.open(url, "_blank");
    }
  }, [computeDiff, allControls]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading framework…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-1.5 flex items-center gap-3 shadow-sm min-w-[1200px]">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-sm font-serif font-semibold mr-3 hidden sm:block">Admin — Controls Editor</h1>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input type="text" placeholder="Search controls…" value={search} onChange={(e) => setSearch(e.target.value)}
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

        <button onClick={downloadCSV}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors active:scale-95 flex items-center gap-1 ${
            dirty ? "border-accent bg-accent text-accent-foreground animate-pulse" : "border-border bg-card hover:bg-muted"
          }`}>
          <Download className="w-3.5 h-3.5" />
          {dirty ? "Save CSV ⬇" : "Download CSV"}
        </button>

        {showIssueButton && (
          <button onClick={openIssue}
            className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-green-600 bg-green-600 text-white hover:bg-green-700 transition-colors active:scale-95 flex items-center gap-1">
            <ExternalLink className="w-3.5 h-3.5" /> Suggest Change
          </button>
        )}
      </header>

      {showFilters && (
        <div className="bg-card border-b border-border px-4 py-3 space-y-2 min-w-[1200px] shadow-sm">
          <ChipFilter label="Lifecycle" options={[...LIFECYCLE_TRIGGERS]} selected={lifecycleFilter} onChange={setLifecycleFilter} />
          <ChipFilter label="First Required" options={firstRequiredOptions} selected={firstRequiredFilter} onChange={setFirstRequiredFilter} />
        </div>
      )}

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
                  <div key={`${ca.id}-${ig}`}
                    className={`border-l border-border px-1.5 py-1.5 space-y-1 transition-colors ${
                      dropTarget?.ca === ca.id && dropTarget?.ig === ig ? "bg-primary/10" : "bg-card/50"
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
                      setDropTarget({ ca: ca.id, ig, index: idx });
                    }}
                    onDragLeave={() => setDropTarget(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(ca.id, ig, dropTarget?.index ?? items.length);
                    }}
                  >
                    {items.map((c, idx) => (
                      <div key={c.controlId} data-card-wrapper>
                        {dropTarget?.ca === ca.id && dropTarget?.ig === ig && dropTarget?.index === idx && (
                          <div className="h-0.5 bg-primary rounded-full my-0.5" />
                        )}
                        <div className={`flex items-stretch gap-0 rounded-md border transition-all bg-card border-border hover:border-primary/40 ${
                          dragControlId === c.controlId ? "opacity-40 scale-95" : ""
                        }`}>
                          <button draggable onDragStart={() => setDragControlId(c.controlId)}
                            onDragEnd={() => { setDragControlId(null); setDropTarget(null); }}
                            onClick={() => { setIsNewCard(false); setActiveControl(c); }}
                            className="flex-1 text-[11px] text-left px-1.5 py-1.5 cursor-grab min-w-0">
                            <span className="leading-tight block">{c.safeguardTitle}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[9px] font-mono text-muted-foreground">{c.controlId}</span>
                              {c.firstRequiredWhen && (
                                <span className="text-[8px] font-medium px-1 py-0.5 rounded bg-accent/30 text-accent-foreground">
                                  {c.firstRequiredWhen}
                                </span>
                              )}
                            </div>
                          </button>
                          <div className="flex flex-col border-l border-border">
                            <button onClick={(e) => { e.stopPropagation(); swapOrder(c.controlId, -1); }} disabled={idx === 0}
                              className="flex-1 px-0.5 hover:bg-muted disabled:opacity-20 transition-colors" title="Move up">
                              <ChevronUp className="w-3 h-3 text-muted-foreground" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); swapOrder(c.controlId, 1); }} disabled={idx === items.length - 1}
                              className="flex-1 px-0.5 hover:bg-muted disabled:opacity-20 transition-colors" title="Move down">
                              <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {dropTarget?.ca === ca.id && dropTarget?.ig === ig && dropTarget?.index === items.length && (
                      <div className="h-0.5 bg-primary rounded-full my-0.5" />
                    )}
                    {items.length === 0 && !dropTarget?.ca && (
                      <div className="text-[10px] text-muted-foreground italic px-1 py-2">—</div>
                    )}
                    <button onClick={() => handleNewInCell(ca.id, ig)}
                      className="w-full text-[10px] text-muted-foreground hover:text-primary py-1 flex items-center justify-center gap-0.5 rounded hover:bg-muted/50 transition-colors"
                      title={`Add control to ${ca.id} ${ig}`}>
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {activeControl && (
        <ControlDetailPanel control={activeControl} onClose={() => { setActiveControl(null); setIsNewCard(false); }} editable onSave={handleSave} onDelete={handleDelete}
          defaultEditing={isNewCard} defaultExpanded={isNewCard} />
      )}

      {showContributePrompt && (
        <ContributePrompt onClose={() => setShowContributePrompt(false)} onOpenIssue={() => { setShowContributePrompt(false); openIssue(); }} csvHash={csvHash} />
      )}
      <ContributorsTicker />
    </div>
  );
}
