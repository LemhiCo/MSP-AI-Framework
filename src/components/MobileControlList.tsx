import { useMemo } from "react";
import { PILLARS, IG_LEVELS, getPillarId, getContentAreaPrefix, type Control } from "@/lib/csv-loader";
import { ContentAreaDot } from "@/components/FrameworkBadges";

const PILLAR_COLORS: Record<string, string> = {
  P1: "0 70% 50%",
  P2: "25 80% 50%",
  P3: "200 50% 42%",
  P4: "168 40% 35%",
  P5: "280 40% 45%",
};

interface Props {
  controls: Control[];
  visiblePillars: readonly (typeof PILLARS)[number][];
  onSelect: (control: Control) => void;
}

export default function MobileControlList({ controls, visiblePillars, onSelect }: Props) {
  const grouped = useMemo(() => {
    const result: { pillar: (typeof PILLARS)[number]; igs: { ig: string; controls: Control[] }[] }[] = [];
    for (const p of visiblePillars) {
      const pillarControls = controls.filter(c => getPillarId(c) === p.id);
      if (pillarControls.length === 0) continue;
      const igs = IG_LEVELS
        .map(ig => ({ ig, controls: pillarControls.filter(c => c.ig === ig) }))
        .filter(g => g.controls.length > 0);
      result.push({ pillar: p, igs });
    }
    return result;
  }, [controls, visiblePillars]);

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
      {grouped.map(({ pillar, igs }) => (
        <div key={pillar.id}>
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: `hsl(${PILLAR_COLORS[pillar.id]})` }} />
            <h2 className="text-sm font-bold">{pillar.id}</h2>
            <span className="text-xs text-muted-foreground truncate">{pillar.name}</span>
          </div>

          {igs.map(({ ig, controls: igControls }) => (
            <div key={ig} className="mb-3">
              <div className="flex items-center gap-1.5 px-1 mb-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ig === "IG1" ? "ig1-badge" : ig === "IG2" ? "ig2-badge" : "ig3-badge"}`}>
                  {ig}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {ig === "IG1" ? "Essential" : ig === "IG2" ? "Managed" : "Advanced"}
                </span>
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
      ))}
    </div>
  );
}
