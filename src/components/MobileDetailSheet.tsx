import { X, Shield, AlertTriangle, Users } from "lucide-react";
import { type Control, IG_META } from "@/lib/csv-loader";
import { useState } from "react";

const TABS = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "compliance", label: "Compliance", icon: AlertTriangle },
  { id: "stakeholders", label: "Stakeholders", icon: Users },
] as const;

interface Props {
  control: Control;
  onClose: () => void;
}

export default function MobileDetailSheet({ control, onClose }: Props) {
  const [tab, setTab] = useState<string>("overview");
  const igMeta = IG_META[control.implementationGuard];

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
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
            {control.implementationGuard}{igMeta ? ` — ${igMeta.name}` : ""}
          </span>
        </div>

        {/* Content area */}
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/30">
            {control.contentArea}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 -mb-px">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-t-md border border-b-0 transition-colors ${
                  tab === t.id ? "bg-background border-border text-foreground" : "bg-transparent border-transparent text-muted-foreground"
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
        {tab === "compliance" && <ComplianceTab control={control} />}
        {tab === "stakeholders" && <StakeholderTab control={control} />}
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
      <Section title="Customer Objective" value={control.customerObjective} />
      <Section title="Detailed Requirement" value={control.detailedRequirement} />
      <div className="rounded-lg border border-border divide-y divide-border">
        <MetaRow label="Lifecycle Trigger" value={control.lifecycleTrigger} />
        <MetaRow label="Cadence" value={control.cadence} />
        <MetaRow label="Primary Stakeholder" value={control.primaryStakeholder} />
        <MetaRow label="Content Area" value={control.contentArea} />
      </div>
      {control.whyItMatters && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">Why it Matters</h3>
          <p className="text-sm leading-relaxed">{control.whyItMatters}</p>
        </div>
      )}
      <Section title="Evidence of Completion" value={control.evidenceOfCompletion} />
    </>
  );
}

function ComplianceTab({ control }: { control: Control }) {
  return (
    <>
      <div className="rounded-lg border border-border divide-y divide-border">
        <MetaRow label="Implementation Guard" value={control.implementationGuard} />
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

function StakeholderTab({ control }: { control: Control }) {
  return (
    <>
      {control.whoCaresMost ? (
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Who Cares Most</h3>
          <div className="flex flex-wrap gap-1.5">
            {control.whoCaresMost.split(/[,|]/).map(role => (
              <span key={role.trim()} className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">{role.trim()}</span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic py-8 text-center">No stakeholder data.</p>
      )}
    </>
  );
}
