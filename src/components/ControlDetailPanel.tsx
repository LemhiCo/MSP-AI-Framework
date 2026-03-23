import { useState, useRef, useCallback } from "react";
import { X, Shield, Wrench, Users, AlertTriangle, GripVertical } from "lucide-react";
import type { Control } from "@/lib/csv-loader";

const MIN_WIDTH = 420;
const DEFAULT_WIDTH = 480;
const EXPAND_THRESHOLD = 640;

interface Props {
  control: Control;
  onClose: () => void;
}

export default function ControlDetailPanel({ control, onClose }: Props) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragging = useRef(false);

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

  return (
    <>
      <div className="fixed inset-0 bg-foreground/20 z-40" onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 bg-card border-l border-border z-50 shadow-xl flex flex-col animate-fade-up"
        style={{ width, animationDuration: "250ms" }}
      >
        {/* Drag handle */}
        <div
          onPointerDown={onPointerDown}
          className="absolute left-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center z-10 hover:bg-primary/10 transition-colors group"
        >
          <GripVertical className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        {/* Header */}
        <div className="shrink-0 bg-card border-b border-border px-5 py-4 flex items-start justify-between ml-3">
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-muted-foreground">{control.controlId}</span>
            <h2 className="text-lg font-serif font-semibold mt-0.5 leading-snug">{control.safeguardTitle}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={control.ig === "IG1" ? "ig1-badge" : control.ig === "IG2" ? "ig2-badge" : "ig3-badge"}>
                {control.ig} — {control.ig === "IG1" ? "Essential" : control.ig === "IG2" ? "Managed" : "Advanced"}
              </span>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                control.gateType === "Baseline Gate"
                  ? "bg-destructive/15 text-destructive"
                  : control.gateType === "Scale Gate"
                  ? "bg-status-yellow/20 text-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {control.gateType}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 ml-3">
          {expanded ? <ExpandedView control={control} /> : <CompactView control={control} />}
        </div>
      </div>
    </>
  );
}

/* ── Expanded: all sections visible at once in a multi-column layout ── */
function ExpandedView({ control }: { control: Control }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {/* Left column */}
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
          <MetaCard label="Applies To" value={control.appliesTo} />
        </div>
        {control.whyItMatters && (
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Why it Matters</h3>
            <p className="text-sm leading-relaxed">{control.whyItMatters}</p>
          </div>
        )}

        <SectionHeader icon={Wrench} label="Tooling" />
        {control.microsoftTool && <InfoBlock label="Microsoft Tooling" value={control.microsoftTool} />}
        {control.genericTooling && <InfoBlock label="Generic Tooling Category" value={control.genericTooling} />}
        {control.evidenceOfCompletion && <InfoBlock label="Evidence of Completion" value={control.evidenceOfCompletion} variant="muted" />}
      </div>

      <div className="space-y-4">
        <SectionHeader icon={Users} label="Customer Value" />
        {control.endCustomerBusinessValue && (
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">End Customer Business Value</h3>
            <p className="text-sm leading-relaxed">{control.endCustomerBusinessValue}</p>
          </div>
        )}
        {control.customerConversationTrack && (
          <div className="bg-muted border border-border rounded-lg p-3 space-y-1">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customer Conversation Track</h3>
            <p className="text-sm leading-relaxed italic">"{control.customerConversationTrack}"</p>
          </div>
        )}
        {control.whoCaresMost && (
          <div className="rounded-lg border border-border p-3 space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Who Cares Most</h3>
            <div className="flex flex-wrap gap-1.5">
              {control.whoCaresMost.split(",").map((role) => (
                <span key={role.trim()} className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  {role.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <SectionHeader icon={AlertTriangle} label="Compliance" />
        <div className="grid grid-cols-2 gap-2">
          <MetaCard label="Raw Weight" value={control.rawWeight} />
          <MetaCard label="Gate Type" value={control.gateType} />
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

/* ── Compact: tabbed view for narrow panel ── */
const TABS = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "tooling", label: "Tooling", icon: Wrench },
  { id: "customer", label: "Customer Value", icon: Users },
  { id: "compliance", label: "Compliance", icon: AlertTriangle },
] as const;

type TabId = (typeof TABS)[number]["id"];

function CompactView({ control }: { control: Control }) {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="border-b border-border bg-muted/30 flex rounded-t-md -mx-5 px-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium transition-colors relative ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
              {active && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-t" />}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {tab === "overview" && <OverviewContent control={control} />}
        {tab === "tooling" && <ToolingContent control={control} />}
        {tab === "customer" && <CustomerContent control={control} />}
        {tab === "compliance" && <ComplianceContent control={control} />}
      </div>
    </div>
  );
}

/* ── Tab content (reused in both views) ── */
function OverviewContent({ control }: { control: Control }) {
  return (
    <>
      <Section title="Customer Objective" value={control.customerObjective} />
      <Section title="Detailed Requirement" value={control.detailedRequirement} />
      <div className="grid grid-cols-2 gap-3">
        <MetaCard label="Lifecycle Trigger" value={control.lifecycleTrigger} />
        <MetaCard label="Cadence" value={control.cadence} />
        <MetaCard label="Primary Stakeholder" value={control.primaryStakeholder} />
        <MetaCard label="Applies To" value={control.appliesTo} />
      </div>
      {control.whyItMatters && (
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Why it Matters</h3>
          <p className="text-sm leading-relaxed">{control.whyItMatters}</p>
        </div>
      )}
    </>
  );
}

function ToolingContent({ control }: { control: Control }) {
  return (
    <>
      {control.microsoftTool && <InfoBlock label="Microsoft Tooling" value={control.microsoftTool} />}
      {control.genericTooling && <InfoBlock label="Generic Tooling Category" value={control.genericTooling} />}
      {control.evidenceOfCompletion && <InfoBlock label="Evidence of Completion" value={control.evidenceOfCompletion} variant="muted" />}
    </>
  );
}

function CustomerContent({ control }: { control: Control }) {
  return (
    <>
      {control.endCustomerBusinessValue && (
        <div className="bg-accent/50 border border-accent rounded-lg p-3 space-y-1">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-accent-foreground/70">End Customer Business Value</h3>
          <p className="text-sm leading-relaxed">{control.endCustomerBusinessValue}</p>
        </div>
      )}
      {control.customerConversationTrack && (
        <div className="bg-muted border border-border rounded-lg p-3 space-y-1">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customer Conversation Track</h3>
          <p className="text-sm leading-relaxed italic">"{control.customerConversationTrack}"</p>
        </div>
      )}
      {control.whoCaresMost && (
        <div className="rounded-lg border border-border p-3 space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Who Cares Most</h3>
          <div className="flex flex-wrap gap-1.5">
            {control.whoCaresMost.split(",").map((role) => (
              <span key={role.trim()} className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                {role.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
      {!control.endCustomerBusinessValue && !control.customerConversationTrack && !control.whoCaresMost && (
        <p className="text-sm text-muted-foreground italic py-8 text-center">No customer value data for this control.</p>
      )}
    </>
  );
}

function ComplianceContent({ control }: { control: Control }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <MetaCard label="Raw Weight" value={control.rawWeight} />
        <MetaCard label="Gate Type" value={control.gateType} />
        <MetaCard label="Min Status to Pass" value={control.minStatusToPass} />
        <MetaCard label="Min Evidence to Pass" value={control.minEvidenceToPass} />
      </div>
      {control.failCondition && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-destructive mb-1">Fail Condition</h3>
          <p className="text-sm leading-relaxed">{control.failCondition}</p>
        </div>
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
