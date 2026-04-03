import { useMemo } from "react";
import { CONTENT_AREAS, IG_LEVELS, IG_META, getContentAreaPrefix, type Control } from "@/lib/csv-loader";
import { ContentAreaDot } from "@/components/FrameworkBadges";

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

interface Props {
  controls: Control[];
  onSelect: (control: Control) => void;
}

export default function MobileControlList({ controls, onSelect }: Props) {
  const grouped = useMemo(() => {
    const result: { ig: string; meta: typeof IG_META[string]; controls: Control[] }[] = [];
    for (const ig of IG_LEVELS) {
      const igControls = controls.filter(c => c.implementationGuard === ig);
      if (igControls.length === 0) continue;
      result.push({ ig, meta: IG_META[ig], controls: igControls });
    }
    return result;
  }, [controls]);

  if (controls.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground px-4">
        <p className="text-base font-medium">No controls match</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="px-3 pt-3 pb-20 space-y-4">
      {grouped.map(({ ig, meta, controls: igControls }) => (
        <div key={ig}>
          <div className="flex items-center gap-2 mb-2 px-1">
            <h2 className="text-sm font-bold">{ig}</h2>
            <span className="text-xs text-muted-foreground truncate">{meta.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono ml-auto">{igControls.length}</span>
          </div>

          <div className="space-y-1.5">
            {igControls.map(c => (
              <button
                key={c.controlId}
                onClick={() => onSelect(c)}
                className="w-full rounded-lg border border-border bg-card text-left px-3 py-2.5 active:scale-[0.98] transition-transform"
              >
                <p className="text-sm font-medium leading-snug">{c.safeguardTitle}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-mono text-muted-foreground">{c.controlId}</span>
                  <ContentAreaDot prefix={getContentAreaPrefix(c)} />
                  {c.firstRequiredWhen && (
                    <span className="text-[8px] font-medium px-1 py-0.5 rounded bg-accent/30 text-accent-foreground">
                      {c.firstRequiredWhen}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
