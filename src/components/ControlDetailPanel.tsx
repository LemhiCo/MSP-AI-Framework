import { useState } from "react";
import { X, Shield, Wrench, Users, AlertTriangle } from "lucide-react";
import type { Control } from "@/lib/csv-loader";

const TABS = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "tooling", label: "Tooling", icon: Wrench },
  { id: "customer", label: "Customer Value", icon: Users },
  { id: "compliance", label: "Compliance", icon: AlertTriangle },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  control: Control;
  onClose: () => void;
}

export default function ControlDetailPanel({ control, onClose }: Props) {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <>
      <div
        className="fixed inset-0 bg-foreground/20 z-40"
        onClick={onClose}
      />
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-card border-l border-border z-50 shadow-xl flex flex-col animate-fade-up"
        style={{ animationDuration: "250ms" }}
      >
        {/* Header */}
        <div className="shrink-0 bg-card border-b border-border px-5 py-4 flex items-start justify-between">
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
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="shrink-0 border-b border-border bg-muted/30 flex">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium transition-colors relative ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-t" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {tab === "overview" && <OverviewTab control={control} />}
          {tab === "tooling" && <ToolingTab control={control} />}
          {tab === "customer" && <CustomerTab control={control} />}
          {tab === "compliance" && <ComplianceTab control={control} />}
        </div>
      </div>
    </>
  );
}

function OverviewTab({ control }: { control: Control }) {
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
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">Why it Matters</h3>
          <p className="text-sm leading-relaxed">{control.whyItMatters}</p>
        </div>
      )}
    </>
  );
}

function ToolingTab({ control }: { control: Control }) {
  return (
    <>
      {control.microsoftTool && (
        <div className="rounded-lg border border-border p-3 space-y-1">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Microsoft Tooling</h3>
          <p className="text-sm leading-relaxed">{control.microsoftTool}</p>
        </div>
      )}
      {control.genericTooling && (
        <div className="rounded-lg border border-border p-3 space-y-1">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Generic Tooling Category</h3>
          <p className="text-sm leading-relaxed">{control.genericTooling}</p>
        </div>
      )}
      {control.evidenceOfCompletion && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Evidence of Completion</h3>
          <p className="text-sm leading-relaxed">{control.evidenceOfCompletion}</p>
        </div>
      )}
    </>
  );
}

function CustomerTab({ control }: { control: Control }) {
  return (
    <>
      {control.endCustomerBusinessValue && (
        <div className="bg-accent/50 border border-accent rounded-lg p-4 space-y-1">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-accent-foreground/70">End Customer Business Value</h3>
          <p className="text-sm leading-relaxed">{control.endCustomerBusinessValue}</p>
        </div>
      )}
      {control.customerConversationTrack && (
        <div className="bg-muted border border-border rounded-lg p-4 space-y-1">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customer Conversation Track</h3>
          <p className="text-sm leading-relaxed italic">"{control.customerConversationTrack}"</p>
        </div>
      )}
      {control.whoCaresMost && (
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Who Cares Most (Customer Side)</h3>
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

function ComplianceTab({ control }: { control: Control }) {
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
