import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { useControls } from "@/hooks/use-framework-data";
import { IGBadge, ContentAreaDot } from "@/components/FrameworkBadges";
import { CONTENT_AREAS, IG_LEVELS, IG_META, LIFECYCLE_TRIGGERS, getContentAreaPrefix, type Control } from "@/lib/csv-loader";

export default function ControlsBrowser() {
  const { data: controls = [], isLoading } = useControls();
  const [search, setSearch] = useState("");
  const [caFilter, setCaFilter] = useState<string>("all");
  const [igFilter, setIgFilter] = useState<string>("all");
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return controls.filter((c) => {
      if (caFilter !== "all" && getContentAreaPrefix(c) !== caFilter) return false;
      if (igFilter !== "all" && c.implementationGuard !== igFilter) return false;
      if (lifecycleFilter !== "all" && !c.lifecycleTrigger.includes(lifecycleFilter)) return false;
      if (q) {
        return (
          c.controlId.toLowerCase().includes(q) ||
          c.safeguardTitle.toLowerCase().includes(q) ||
          c.customerObjective.toLowerCase().includes(q) ||
          c.detailedRequirement.toLowerCase().includes(q) ||
          c.contentArea.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [controls, search, caFilter, igFilter, lifecycleFilter]);

  const groupedByCA = useMemo(() => {
    const groups: Record<string, Control[]> = {};
    for (const c of filtered) {
      const key = getContentAreaPrefix(c);
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
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search controls, content areas, objectives…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterSelect label="Content Area" value={caFilter} onChange={setCaFilter}
            options={[{ value: "all", label: "All Areas" }, ...CONTENT_AREAS.map((ca) => ({ value: ca.id, label: ca.name }))]} />
          <FilterSelect label="IG Level" value={igFilter} onChange={setIgFilter}
            options={[{ value: "all", label: "All Guards" }, ...IG_LEVELS.map((ig) => ({ value: ig, label: `${ig} — ${IG_META[ig].name}` }))]} />
          <FilterSelect label="Lifecycle" value={lifecycleFilter} onChange={setLifecycleFilter}
            options={[{ value: "all", label: "All Triggers" }, ...LIFECYCLE_TRIGGERS.map((t) => ({ value: t, label: t }))]} />
          <span className="ml-auto text-xs text-muted-foreground self-center font-mono tabular-nums">
            {filtered.length} of {controls.length} controls
          </span>
        </div>
      </div>

      {CONTENT_AREAS.map((ca) => {
        const items = groupedByCA[ca.id];
        if (!items || items.length === 0) return null;
        return (
          <div key={ca.id} className="space-y-1">
            <div className="flex items-center gap-2 px-1 mb-2">
              <ContentAreaDot prefix={ca.id} />
              <h3 className="text-sm font-semibold text-foreground">{ca.name}</h3>
              <span className="text-xs text-muted-foreground font-mono">({items.length})</span>
            </div>
            <div className="space-y-1">
              {items.map((control) => (
                <ControlRow key={control.controlId} control={control} expanded={expandedId === control.controlId}
                  onToggle={() => setExpandedId(expandedId === control.controlId ? null : control.controlId)} />
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
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors active:scale-[0.995]">
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
        <span className="font-mono text-xs text-muted-foreground w-24 flex-shrink-0">{control.controlId}</span>
        <span className="text-sm font-medium flex-1 min-w-0 truncate">{control.safeguardTitle}</span>
        <IGBadge ig={control.implementationGuard} />
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
            <DetailField label="Content Area" value={control.contentArea} />
            <DetailField label="Implementation Guard" value={control.implementationGuard} />
            <DetailField label="First Required When" value={control.firstRequiredWhen} />
          </div>
          <DetailField label="Evidence of Completion" value={control.evidenceOfCompletion} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailField label="Min Status to Pass" value={control.minStatusToPass} />
            <DetailField label="Min Evidence to Pass" value={control.minEvidenceToPass} />
          </div>
          {control.failCondition && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-md p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-destructive mb-1">Fail Condition</h4>
              <p className="text-sm leading-relaxed">{control.failCondition}</p>
            </div>
          )}
          {control.whyItMatters && (
            <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Why it Matters</h4>
              <p className="text-sm leading-relaxed">{control.whyItMatters}</p>
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

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="text-xs font-medium border border-border rounded-md px-2.5 py-1.5 bg-card focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer" aria-label={label}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
