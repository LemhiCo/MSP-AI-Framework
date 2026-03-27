import { X, Shield, Wrench, Users, AlertTriangle } from "lucide-react";
import { type Control, AI_MODALITIES } from "@/lib/csv-loader";
import { useState } from "react";

const TABS = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "tooling", label: "Tooling", icon: Wrench },
  { id: "value", label: "Value", icon: Users },
  { id: "compliance", label: "Compliance", icon: AlertTriangle },
] as const;

interface Props {
  control: Control;
  onClose: () => void;
}

export default function MobileDetailSheet({ control, onClose }: Props) {
  const [tab, setTab] = useState<string>("overview");

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background animate-fade-up" style={{ animationDuration: "200ms" }}>
      {/* Header */}
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-muted-foreground">{control.controlId}</span>
            <h2 className="text-base font-serif font-semibold leading-snug mt-0.5">{control.safeguardTitle}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted shrink-0 -mr-1 mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className={control.ig === "IG1" ? "ig1-badge" : control.ig === "IG2" ? "ig2-badge" : "ig3-badge"}>
            {control.ig}
          </span>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
            control.gateType === "Baseline Gate" ? "bg-destructive/15 text-destructive"
              : control.gateType === "Scale Gate" ? "bg-status-yellow/20 text-foreground"
              : "bg-muted text-muted-foreground"
          }`}>{control.gateType}</span>
          {control.firstRequiredWhen && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-accent/50 text-accent-foreground">
              {control.firstRequiredWhen}
            </span>
          )}
        </div>

        {/* AI modalities */}
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {AI_MODALITIES.map(m => (
            <span key={m.key}
              className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${
                control[m.key] === "Yes" ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted/50 text-muted-foreground/50 border-border line-through"
              }`}>{m.label}</span>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 -mb-px">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-t-md border border-b-0 transition-colors ${
                  tab === t.id
                    ? "bg-background border-border text-foreground"
                    : "bg-transparent border-transparent text-muted-foreground"
                }`}>
                <Icon className="w-3 h-3" />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {tab === "overview" && <OverviewTab control={control} />}
        {tab === "tooling" && <ToolingTab control={control} />}
        {tab === "value" && <ValueTab control={control} />}
        {tab === "compliance" && <ComplianceTab control={control} />}
      </div>
    </div>
  );
}

function Section({ title, value }: { title: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{title}</h3>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function OverviewTab({ control }: { control: Control }) {
  return (
    <>
      <Section title="ELI5" value={control.eli5} />
      <Section title="Customer Objective" value={control.customerObjective} />
      <Section title="Detailed Requirement" value={control.detailedRequirement} />
      <div className="rounded-lg border border-border divide-y divide-border">
        <MetaRow label="Lifecycle Trigger" value={control.lifecycleTrigger} />
        <MetaRow label="Cadence" value={control.cadence} />
        <MetaRow label="Primary Stakeholder" value={control.primaryStakeholder} />
        <MetaRow label="Applies To" value={control.appliesTo} />
      </div>
      {control.whyItMatters && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
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
      <Section title="Microsoft Tool Recommendation" value={control.microsoftTool} />
      <Section title="Generic Tooling Category" value={control.genericTooling} />
      <Section title="Evidence of Completion" value={control.evidenceOfCompletion} />
    </>
  );
}

function ValueTab({ control }: { control: Control }) {
  return (
    <>
      <Section title="End Customer Business Value" value={control.endCustomerBusinessValue} />
      {control.customerConversationTrack && (
        <div className="bg-muted border border-border rounded-lg p-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Conversation Track</h3>
          <p className="text-sm leading-relaxed italic">"{control.customerConversationTrack}"</p>
        </div>
      )}
      {control.whoCaresMost && (
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Who Cares Most</h3>
          <div className="flex flex-wrap gap-1.5">
            {control.whoCaresMost.split(",").map(role => (
              <span key={role.trim()} className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">{role.trim()}</span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function ComplianceTab({ control }: { control: Control }) {
  return (
    <>
      <div className="rounded-lg border border-border divide-y divide-border">
        <MetaRow label="Raw Weight" value={control.rawWeight} />
        <MetaRow label="Gate Type" value={control.gateType} />
        <MetaRow label="Min Status to Pass" value={control.minStatusToPass} />
        <MetaRow label="Min Evidence to Pass" value={control.minEvidenceToPass} />
      </div>
      {control.failCondition && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-destructive mb-1">Fail Condition</h3>
          <p className="text-sm leading-relaxed">{control.failCondition}</p>
        </div>
      )}
    </>
  );
}
