import { useState, useRef, useCallback, useEffect } from "react";
import { X, Shield, Wrench, Users, AlertTriangle, GripVertical, Pencil, Save, Trash2, ExternalLink } from "lucide-react";
import { type Control, PILLARS, IG_LEVELS, LIFECYCLE_TRIGGERS, CONTENT_AREAS } from "@/lib/csv-loader";

const MIN_WIDTH = 420;
const DEFAULT_WIDTH = 480;
const EXPAND_THRESHOLD = 640;

const SELECT_FIELDS: Partial<Record<keyof Control, string[]>> = {
  implementationPillar: PILLARS.map(p => `Pillar ${PILLARS.indexOf(p) + 1} – ${p.name}`),
  ig: [...IG_LEVELS],
  criticalityLevel: ["Critical", "High", "Medium-High", "Medium", "Advanced / Specialized"],
  lifecycleTrigger: [...LIFECYCLE_TRIGGERS],
  firstRequiredWhen: ["GenAI", "Cowork", "Custom GPTs", "Agentic AI"],
};

const TEXTAREA_FIELDS: Set<keyof Control> = new Set([
  "customerObjective", "detailedRequirement", "whyItMatters",
  "failCondition", "evidenceOfCompletion",
]);

interface Props {
  control: Control;
  onClose: () => void;
  editable?: boolean;
  onSave?: (updated: Control) => void;
  onDelete?: (id: string) => void;
  defaultEditing?: boolean;
  defaultExpanded?: boolean;
}

export default function ControlDetailPanel({ control, onClose, editable, onSave, onDelete, defaultEditing, defaultExpanded }: Props) {
  const [width, setWidth] = useState(defaultExpanded ? Math.max(EXPAND_THRESHOLD + 100, DEFAULT_WIDTH) : DEFAULT_WIDTH);
  const dragging = useRef(false);
  const [editing, setEditing] = useState(!!defaultEditing);
  const [draft, setDraft] = useState<Control>({ ...control });

  useEffect(() => {
    setDraft({ ...control });
    setEditing(false);
  }, [control]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    const onMove = (ev: PointerEvent) => {
      if (!dragging.current) return;
      const maxW = window.innerWidth * 0.8;
      const newW = Math.min(maxW, Math.max(MIN_WIDTH, window.innerWidth - ev.clientX));
      setWidth(newW);
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const expanded = width >= EXPAND_THRESHOLD;
  const isNew = !control.controlId;

  const handleStartEdit = () => { setDraft({ ...control }); setEditing(true); };
  const handleSave = () => { onSave?.(draft); setEditing(false); };
  const handleDelete = () => { if (confirm(`Delete ${control.controlId}?`)) onDelete?.(control.controlId); };
  const handleCancel = () => { if (isNew) { onClose(); return; } setDraft({ ...control }); setEditing(false); };
  const updateField = (key: keyof Control, value: string) => setDraft(prev => ({ ...prev, [key]: value }));

  const showEdit = editing || isNew;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/20 z-40" onClick={showEdit ? undefined : onClose} />
      <div className="fixed right-0 top-0 bottom-0 bg-card border-l border-border z-50 shadow-xl flex flex-col animate-fade-up" style={{ width, animationDuration: "250ms" }}>
        {/* Drag handle */}
        <div onPointerDown={onPointerDown} className="absolute left-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center z-10 hover:bg-primary/10 transition-colors group">
          <GripVertical className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        {/* Header */}
        <div className="shrink-0 bg-card border-b border-border px-5 py-4 flex items-start justify-between ml-3">
          <div className="min-w-0 flex-1">
            {showEdit ? (
              <>
                <EditField fieldKey="controlId" value={draft.controlId} onChange={updateField} placeholder="e.g. OBS-IG1-01" label="Control ID" />
                <EditField fieldKey="safeguardTitle" value={draft.safeguardTitle} onChange={updateField} placeholder="Safeguard Title" label="" className="mt-1" />
              </>
            ) : (
              <>
                <span className="text-[10px] font-mono text-muted-foreground">{control.controlId}</span>
                <h2 className="text-lg font-serif font-semibold mt-0.5 leading-snug">{control.safeguardTitle}</h2>
              </>
            )}
            {!showEdit && (
              <>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={control.ig === "IG1" ? "ig1-badge" : control.ig === "IG2" ? "ig2-badge" : "ig3-badge"}>
                    {control.ig} — {control.ig === "IG1" ? "Essential" : control.ig === "IG2" ? "Managed" : "Advanced"}
                  </span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {control.criticalityLevel}
                  </span>
                  {control.firstRequiredWhen && (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-accent/50 text-accent-foreground">
                      {control.firstRequiredWhen}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/30">
                    {control.contentArea}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {editable && !showEdit && (
              <>
                <button onClick={handleStartEdit} className="p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors active:scale-95" title="Edit">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={handleDelete} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors active:scale-95" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            {showEdit && (
              <>
                <button onClick={handleSave} className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors active:scale-95 flex items-center gap-1">
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={handleCancel} className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors active:scale-95">Cancel</button>
                <a href="https://github.com/LemhiCo/MSP-AI-Framework/issues" target="_blank" rel="noopener noreferrer" className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> View Open Contributions
                </a>
              </>
            )}
            {!showEdit && (
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95 shrink-0">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 ml-3">
          {showEdit ? (
            <EditView draft={draft} onChange={updateField} />
          ) : expanded ? (
            <ExpandedView control={control} />
          ) : (
            <CompactView control={control} />
          )}
        </div>
      </div>
    </>
  );
}

/* ── Edit View ── */
function EditView({ draft, onChange }: { draft: Control; onChange: (key: keyof Control, value: string) => void }) {
  const fieldGroups: { title: string; icon: React.ElementType; fields: { key: keyof Control; label: string }[] }[] = [
    {
      title: "Classification", icon: Shield,
      fields: [
        { key: "implementationPillar", label: "Implementation Pillar" },
        { key: "ig", label: "Implementation Group" },
        { key: "criticalityLevel", label: "Criticality Level" },
        { key: "contentArea", label: "Content Area" },
        { key: "firstRequiredWhen", label: "First Required When" },
      ],
    },
    {
      title: "Overview", icon: Shield,
      fields: [
        { key: "customerObjective", label: "Customer Objective" },
        { key: "detailedRequirement", label: "Detailed Requirement" },
        { key: "lifecycleTrigger", label: "Lifecycle Trigger" },
        { key: "cadence", label: "Cadence" },
        { key: "primaryStakeholder", label: "Primary Stakeholder" },
        { key: "whyItMatters", label: "Why it Matters" },
      ],
    },
    {
      title: "Evidence & Compliance", icon: AlertTriangle,
      fields: [
        { key: "evidenceOfCompletion", label: "Evidence of Completion" },
        { key: "minStatusToPass", label: "Min Status to Pass" },
        { key: "minEvidenceToPass", label: "Min Evidence to Pass" },
        { key: "failCondition", label: "Fail Condition" },
      ],
    },
    {
      title: "Stakeholders", icon: Users,
      fields: [
        { key: "whoCaresMost", label: "Who Cares Most (Customer)" },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {fieldGroups.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.title}>
            <div className="flex items-center gap-1.5 border-b border-border pb-1 mb-3">
              <Icon className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">{group.title}</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {group.fields.map(({ key, label }) => {
                const options = SELECT_FIELDS[key];
                const isTextarea = TEXTAREA_FIELDS.has(key);
                return (
                  <div key={key}>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5 block">{label}</label>
                    {options ? (
                      <select value={draft[key]} onChange={e => onChange(key, e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">—</option>
                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : isTextarea ? (
                      <textarea value={draft[key]} onChange={e => onChange(key, e.target.value)} rows={3}
                        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[60px]" />
                    ) : (
                      <input type="text" value={draft[key]} onChange={e => onChange(key, e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                    )}
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

function EditField({ fieldKey, value, onChange, placeholder, label, className = "" }: {
  fieldKey: keyof Control; value: string; onChange: (key: keyof Control, val: string) => void;
  placeholder: string; label: string; className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>}
      <input type="text" value={value} onChange={e => onChange(fieldKey, e.target.value)} placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}

/* ── Expanded View ── */
function ExpandedView({ control }: { control: Control }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      <div className="space-y-4 col-span-2">
        <Section title="Customer Objective" value={control.customerObjective} />
        <Section title="Detailed Requirement" value={control.detailedRequirement} />
      </div>
      <div className="space-y-4">
        <SectionHeader icon={Shield} label="Overview" />
        <div className="grid grid-cols-2 gap-2">
          <MetaCard label="Lifecycle Trigger" value={control.lifecycleTrigger} />
          <MetaCard label="Cadence" value={control.cadence} />
          <MetaCard label="Primary Stakeholder" value={control.primaryStakeholder} />
          <MetaCard label="Content Area" value={control.contentArea} />
        </div>
        {control.whyItMatters && (
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Why it Matters</h3>
            <p className="text-sm leading-relaxed">{control.whyItMatters}</p>
          </div>
        )}
        {control.evidenceOfCompletion && <InfoBlock label="Evidence of Completion" value={control.evidenceOfCompletion} variant="muted" />}
      </div>
      <div className="space-y-4">
        <SectionHeader icon={Users} label="Stakeholders" />
        {control.whoCaresMost && (
          <div className="rounded-lg border border-border p-3 space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Who Cares Most</h3>
            <div className="flex flex-wrap gap-1.5">
              {control.whoCaresMost.split(/[,|]/).map((role) => (
                <span key={role.trim()} className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">{role.trim()}</span>
              ))}
            </div>
          </div>
        )}
        <SectionHeader icon={AlertTriangle} label="Compliance" />
        <div className="grid grid-cols-2 gap-2">
          <MetaCard label="Criticality" value={control.criticalityLevel} />
          <MetaCard label="Min Status to Pass" value={control.minStatusToPass} />
          <MetaCard label="Min Evidence to Pass" value={control.minEvidenceToPass} />
        </div>
        {control.failCondition && (
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Fail Condition</h3>
            <p className="text-sm leading-relaxed">{control.failCondition}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Compact View ── */
const TABS = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "compliance", label: "Compliance", icon: AlertTriangle },
  { id: "stakeholders", label: "Stakeholders", icon: Users },
] as const;

type TabId = (typeof TABS)[number]["id"];

function CompactView({ control }: { control: Control }) {
  const [tab, setTab] = useState<TabId>("overview");
  return (
    <div className="space-y-4">
      <div className="border-b border-border bg-muted/30 flex rounded-t-md -mx-5 px-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium transition-colors relative ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
              {active && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-t" />}
            </button>
          );
        })}
      </div>
      <div className="space-y-4">
        {tab === "overview" && <OverviewContent control={control} />}
        {tab === "compliance" && <ComplianceContent control={control} />}
        {tab === "stakeholders" && <StakeholderContent control={control} />}
      </div>
    </div>
  );
}

function OverviewContent({ control }: { control: Control }) {
  return (
    <>
      <Section title="Customer Objective" value={control.customerObjective} />
      <Section title="Detailed Requirement" value={control.detailedRequirement} />
      <div className="grid grid-cols-2 gap-3">
        <MetaCard label="Lifecycle Trigger" value={control.lifecycleTrigger} />
        <MetaCard label="Cadence" value={control.cadence} />
        <MetaCard label="Primary Stakeholder" value={control.primaryStakeholder} />
        <MetaCard label="Content Area" value={control.contentArea} />
      </div>
      {control.whyItMatters && (
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Why it Matters</h3>
          <p className="text-sm leading-relaxed">{control.whyItMatters}</p>
        </div>
      )}
      {control.evidenceOfCompletion && <InfoBlock label="Evidence of Completion" value={control.evidenceOfCompletion} variant="muted" />}
    </>
  );
}

function ComplianceContent({ control }: { control: Control }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <MetaCard label="Criticality Level" value={control.criticalityLevel} />
        <MetaCard label="Min Status to Pass" value={control.minStatusToPass} />
        <MetaCard label="Min Evidence to Pass" value={control.minEvidenceToPass} />
      </div>
      {control.failCondition && (
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Fail Condition</h3>
          <p className="text-sm leading-relaxed">{control.failCondition}</p>
        </div>
      )}
    </>
  );
}

function StakeholderContent({ control }: { control: Control }) {
  return (
    <>
      {control.whoCaresMost && (
        <div className="rounded-lg border border-border p-3 space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Who Cares Most</h3>
          <div className="flex flex-wrap gap-1.5">
            {control.whoCaresMost.split(/[,|]/).map((role) => (
              <span key={role.trim()} className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">{role.trim()}</span>
            ))}
          </div>
        </div>
      )}
      {!control.whoCaresMost && (
        <p className="text-sm text-muted-foreground italic py-8 text-center">No stakeholder data for this control.</p>
      )}
    </>
  );
}

/* ── Shared primitives ── */
function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-border pb-1 pt-2">
      <Icon className="w-3.5 h-3.5 text-primary" />
      <span className="text-xs font-bold uppercase tracking-wider text-primary">{label}</span>
    </div>
  );
}

function Section({ title, value }: { title: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{title}</h3>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
      <p className="text-xs font-medium leading-snug">{value}</p>
    </div>
  );
}

function InfoBlock({ label, value, variant }: { label: string; value: string; variant?: "muted" }) {
  return (
    <div className={`rounded-lg border border-border p-3 space-y-1 ${variant === "muted" ? "bg-muted/30" : ""}`}>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</h3>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}
