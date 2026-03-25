import { useState, useMemo, useCallback } from "react";
import { Search, Plus, Download, ArrowLeft, Pencil, Trash2, Save, X } from "lucide-react";
import { useControls } from "@/hooks/use-framework-data";
import { PILLARS, IG_LEVELS, AI_MODALITIES, LIFECYCLE_TRIGGERS, type Control } from "@/lib/csv-loader";
import { Link } from "react-router-dom";
import Papa from "papaparse";

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

const FIELD_LABELS: Record<keyof Control, string> = {
  controlId: "Control ID", pillar: "Pillar", ig: "IG", safeguardTitle: "Safeguard Title",
  customerObjective: "Customer Objective", detailedRequirement: "Detailed Requirement",
  lifecycleTrigger: "Lifecycle Trigger", cadence: "Cadence",
  primaryStakeholder: "Primary Stakeholder", microsoftTool: "Microsoft Tool Recommendation",
  genericTooling: "Generic Tooling Category", evidenceOfCompletion: "Evidence of Completion",
  rawWeight: "Raw Weight", gateType: "Gate Type", minStatusToPass: "Minimum Status to Pass",
  minEvidenceToPass: "Minimum Evidence to Pass", failCondition: "Fail Condition",
  whyItMatters: "Why it Matters", appliesTo: "Applies To",
  endCustomerBusinessValue: "End Customer Business Value",
  customerConversationTrack: "Customer Conversation Track",
  whoCaresMost: "Who Cares Most (Customer)", relevantGenAI: "Relevant: GenAI",
  relevantCustomGPTs: "Relevant: Custom GPTs", relevantAgenticAI: "Relevant: Agentic AI",
  relevantDigitalWorkers: "Relevant: Digital Workers", relevantCowork: "Relevant: Cowork",
  firstRequiredWhen: "First Required When",
};

const SELECT_FIELDS: Partial<Record<keyof Control, string[]>> = {
  pillar: PILLARS.map(p => p.id),
  ig: [...IG_LEVELS],
  gateType: ["Baseline Gate", "Scale Gate", "Advanced Score"],
  lifecycleTrigger: [...LIFECYCLE_TRIGGERS],
  relevantGenAI: ["Yes", "No"],
  relevantCustomGPTs: ["Yes", "No"],
  relevantAgenticAI: ["Yes", "No"],
  relevantDigitalWorkers: ["Yes", "No"],
  relevantCowork: ["Yes", "No"],
};

const TEXTAREA_FIELDS: Set<keyof Control> = new Set([
  "customerObjective", "detailedRequirement", "whyItMatters",
  "endCustomerBusinessValue", "customerConversationTrack", "failCondition",
  "evidenceOfCompletion",
]);

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

export default function Admin() {
  const { data: loadedControls = [], isLoading } = useControls();
  const [controls, setControls] = useState<Control[] | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Control | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [dirty, setDirty] = useState(false);

  const allControls = controls ?? loadedControls;

  const filtered = useMemo(() => {
    if (!search) return allControls;
    const q = search.toLowerCase();
    return allControls.filter(c =>
      c.controlId.toLowerCase().includes(q) ||
      c.safeguardTitle.toLowerCase().includes(q) ||
      c.pillar.toLowerCase().includes(q)
    );
  }, [allControls, search]);

  const startEdit = (c: Control) => { setEditing({ ...c }); setIsNew(false); };
  const startNew = () => { setEditing({ ...EMPTY_CONTROL }); setIsNew(true); };

  const saveEdit = () => {
    if (!editing) return;
    const updated = isNew
      ? [...allControls, editing]
      : allControls.map(c => c.controlId === editing.controlId ? editing : c);
    setControls(updated);
    setEditing(null);
    setDirty(true);
  };

  const deleteControl = (id: string) => {
    if (!confirm(`Delete ${id}?`)) return;
    setControls(allControls.filter(c => c.controlId !== id));
    setDirty(true);
  };

  const downloadCSV = useCallback(() => {
    const rows = allControls.map(controlToCSVRow);
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "controls.csv";
    a.click();
    URL.revokeObjectURL(url);
    setDirty(false);
  }, [allControls]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-2 flex items-center gap-3 shadow-sm">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-sm font-serif font-semibold">Admin — Controls Editor</h1>

        <div className="relative flex-1 max-w-xs ml-4">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text" placeholder="Search controls…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        <button onClick={startNew}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-[41px] z-10 bg-muted">
            <tr>
              <th className="text-left px-3 py-2 font-semibold border-b border-border">Control ID</th>
              <th className="text-left px-3 py-2 font-semibold border-b border-border">Pillar</th>
              <th className="text-left px-3 py-2 font-semibold border-b border-border">IG</th>
              <th className="text-left px-3 py-2 font-semibold border-b border-border">Safeguard Title</th>
              <th className="text-left px-3 py-2 font-semibold border-b border-border">Gate Type</th>
              <th className="text-left px-3 py-2 font-semibold border-b border-border">First Required</th>
              <th className="text-left px-3 py-2 font-semibold border-b border-border w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.controlId} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-3 py-2 font-mono text-muted-foreground">{c.controlId}</td>
                <td className="px-3 py-2">{c.pillar}</td>
                <td className="px-3 py-2">{c.ig}</td>
                <td className="px-3 py-2 max-w-[300px] truncate">{c.safeguardTitle}</td>
                <td className="px-3 py-2">{c.gateType}</td>
                <td className="px-3 py-2">{c.firstRequiredWhen}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(c)} className="p-1 rounded hover:bg-primary/10 text-primary transition-colors" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteControl(c.controlId)} className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground italic">No controls found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <EditModal
          control={editing}
          isNew={isNew}
          onChange={setEditing}
          onSave={saveEdit}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function EditModal({ control, isNew, onChange, onSave, onCancel }: {
  control: Control; isNew: boolean;
  onChange: (c: Control) => void; onSave: () => void; onCancel: () => void;
}) {
  const update = (key: keyof Control, value: string) => onChange({ ...control, [key]: value });
  const fields = Object.keys(FIELD_LABELS) as (keyof Control)[];

  return (
    <>
      <div className="fixed inset-0 bg-foreground/30 z-40" onClick={onCancel} />
      <div className="fixed inset-4 md:inset-y-4 md:left-[15%] md:right-[15%] bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border px-5 py-3 flex items-center justify-between bg-muted/30">
          <h2 className="text-sm font-serif font-semibold">
            {isNew ? "New Control" : `Edit ${control.controlId}`}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={onSave}
              className="text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors active:scale-95 flex items-center gap-1">
              <Save className="w-3.5 h-3.5" /> Save
            </button>
            <button onClick={onCancel} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {fields.map(key => {
              const label = FIELD_LABELS[key];
              const options = SELECT_FIELDS[key];
              const isTextarea = TEXTAREA_FIELDS.has(key);

              return (
                <div key={key} className={`space-y-1 ${isTextarea ? "md:col-span-2 lg:col-span-3" : ""}`}>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
                  {options ? (
                    <select
                      value={control[key]}
                      onChange={e => update(key, e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">—</option>
                      {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : isTextarea ? (
                    <textarea
                      value={control[key]}
                      onChange={e => update(key, e.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[60px]"
                    />
                  ) : (
                    <input
                      type="text"
                      value={control[key]}
                      onChange={e => update(key, e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
