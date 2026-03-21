import { useState, useMemo } from "react";
import { Search, Filter, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useControls } from "@/hooks/use-framework-data";
import { IGBadge, PillarDot } from "@/components/FrameworkBadges";
import { PILLARS, IG_LEVELS, LIFECYCLE_TRIGGERS, type Control } from "@/lib/csv-loader";

export default function ControlsBrowser() {
  const { data: controls = [], isLoading } = useControls();
  const [search, setSearch] = useState("");
  const [pillarFilter, setPillarFilter] = useState<string>("all");
  const [igFilter, setIgFilter] = useState<string>("all");
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return controls.filter((c) => {
      if (pillarFilter !== "all" && !c.controlId.startsWith(pillarFilter)) return false;
      if (igFilter !== "all" && c.ig !== igFilter) return false;
      if (lifecycleFilter !== "all" && c.lifecycleTrigger !== lifecycleFilter) return false;
      if (q) {
        return (
          c.controlId.toLowerCase().includes(q) ||
          c.safeguardTitle.toLowerCase().includes(q) ||
          c.customerObjective.toLowerCase().includes(q) ||
          c.detailedRequirement.toLowerCase().includes(q) ||
          c.genericTooling.toLowerCase().includes(q) ||
          c.microsoftTool.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [controls, search, pillarFilter, igFilter, lifecycleFilter]);

  const groupedByPillar = useMemo(() => {
    const groups: Record<string, Control[]> = {};
    for (const c of filtered) {
      const key = c.pillar;
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    }
    return groups;
  }, [filtered]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading controls…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Search + Filters */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search controls, tools, objectives…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterSelect
            label="Pillar"
            value={pillarFilter}
            onChange={setPillarFilter}
            options={[{ value: "all", label: "All Pillars" }, ...PILLARS.map((p) => ({ value: p.id, label: p.name }))]}
          />
          <FilterSelect
            label="IG Level"
            value={igFilter}
            onChange={setIgFilter}
            options={[
              { value: "all", label: "All Levels" },
              { value: "IG1", label: "IG1 — Essential" },
              { value: "IG2", label: "IG2 — Managed" },
              { value: "IG3", label: "IG3 — Advanced" },
            ]}
          />
          <FilterSelect
            label="Lifecycle"
            value={lifecycleFilter}
            onChange={setLifecycleFilter}
            options={[
              { value: "all", label: "All Triggers" },
              ...LIFECYCLE_TRIGGERS.map((t) => ({ value: t, label: t })),
            ]}
          />
          <span className="ml-auto text-xs text-muted-foreground self-center font-mono tabular-nums">
            {filtered.length} of {controls.length} controls
          </span>
        </div>
      </div>

      {/* Controls List */}
      {Object.entries(groupedByPillar).map(([pillar, items]) => {
        const pillarInfo = PILLARS.find((p) => p.name === pillar);
        return (
          <div key={pillar} className="space-y-1">
            <div className="flex items-center gap-2 px-1 mb-2">
              {pillarInfo && <PillarDot pillarId={pillarInfo.id} />}
              <h3 className="text-sm font-semibold text-foreground">{pillar}</h3>
              <span className="text-xs text-muted-foreground font-mono">({items.length})</span>
            </div>
            <div className="space-y-1">
              {items.map((control) => (
                <ControlRow
                  key={control.controlId}
                  control={control}
                  expanded={expandedId === control.controlId}
                  onToggle={() => setExpandedId(expandedId === control.controlId ? null : control.controlId)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No controls match your filters</p>
          <p className="text-sm mt-1">Try adjusting search or filter criteria</p>
        </div>
      )}
    </div>
  );
}

function ControlRow({ control, expanded, onToggle }: { control: Control; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors active:scale-[0.995]"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
        <span className="font-mono text-xs text-muted-foreground w-24 flex-shrink-0">{control.controlId}</span>
        <span className="text-sm font-medium flex-1 min-w-0 truncate">{control.safeguardTitle}</span>
        <IGBadge ig={control.ig} />
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border space-y-4 animate-fade-up" style={{ animationDuration: "300ms" }}>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Customer Objective</h4>
            <p className="text-sm leading-relaxed">{control.customerObjective}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Detailed Requirement</h4>
            <p className="text-sm leading-relaxed">{control.detailedRequirement}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailField label="Lifecycle Trigger" value={control.lifecycleTrigger} />
            <DetailField label="Cadence" value={control.cadence} />
            <DetailField label="Primary Stakeholder" value={control.primaryStakeholder} />
            <DetailField label="Applies To" value={control.appliesTo} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailField label="Microsoft Tooling" value={control.microsoftTool} />
            <DetailField label="Generic Tooling" value={control.genericTooling} />
          </div>
          <div>
            <DetailField label="Evidence of Completion" value={control.evidenceOfCompletion} />
          </div>
          {control.notesGuardrails && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">Notes & Guardrails</h4>
              <p className="text-sm text-amber-900 leading-relaxed">{control.notesGuardrails}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">{label}</h4>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs font-medium border border-border rounded-md px-2.5 py-1.5 bg-card focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
      aria-label={label}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
