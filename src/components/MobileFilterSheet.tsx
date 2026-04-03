import { X } from "lucide-react";
import { LIFECYCLE_TRIGGERS, CONTENT_AREAS } from "@/lib/csv-loader";

interface Props {
  open: boolean;
  onClose: () => void;
  lifecycleFilter: Set<string>;
  setLifecycleFilter: (s: Set<string>) => void;
  firstRequiredFilter: Set<string>;
  setFirstRequiredFilter: (s: Set<string>) => void;
  firstRequiredOptions: string[];
  contentAreaFilter: Set<string>;
  setContentAreaFilter: (s: Set<string>) => void;
  activeCount: number;
  onClear: () => void;
}

function ChipGroup({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: Set<string>;
  onChange: (s: Set<string>) => void;
}) {
  const toggle = (v: string) => {
    const next = new Set(selected);
    next.has(v) ? next.delete(v) : next.add(v);
    onChange(next);
  };
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o} onClick={() => toggle(o)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              selected.has(o)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border"
            }`}
          >{o}</button>
        ))}
      </div>
    </div>
  );
}

export default function MobileFilterSheet({
  open, onClose,
  lifecycleFilter, setLifecycleFilter,
  firstRequiredFilter, setFirstRequiredFilter,
  firstRequiredOptions,
  contentAreaFilter, setContentAreaFilter,
  activeCount, onClear,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative mt-auto bg-card border-t border-border rounded-t-2xl max-h-[80vh] flex flex-col animate-fade-up" style={{ animationDuration: "250ms" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold">Filters{activeCount > 0 ? ` (${activeCount})` : ""}</h2>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button onClick={onClear} className="text-xs text-muted-foreground hover:text-foreground">
                Clear all
              </button>
            )}
            <button onClick={onClose}><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="overflow-y-auto px-4 py-4 space-y-5">
          <ChipGroup label="Content Area" options={CONTENT_AREAS.map(ca => ca.id)} selected={contentAreaFilter} onChange={setContentAreaFilter} />
          <ChipGroup label="Lifecycle Trigger" options={[...LIFECYCLE_TRIGGERS]} selected={lifecycleFilter} onChange={setLifecycleFilter} />
          <ChipGroup label="First Required When" options={firstRequiredOptions} selected={firstRequiredFilter} onChange={setFirstRequiredFilter} />
        </div>
        <div className="px-4 py-3 border-t border-border shrink-0">
          <button onClick={onClose}
            className="w-full text-sm font-medium py-2.5 rounded-lg bg-primary text-primary-foreground active:scale-[0.98] transition-transform">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
