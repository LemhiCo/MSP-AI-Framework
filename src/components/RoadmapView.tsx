import { useMemo } from "react";
import { useControls } from "@/hooks/use-framework-data";
import { IGBadge, ContentAreaDot } from "@/components/FrameworkBadges";
import { CONTENT_AREAS, IG_LEVELS, IG_META, LIFECYCLE_TRIGGERS, getContentAreaPrefix, type Control } from "@/lib/csv-loader";

export default function RoadmapView() {
  const { data: controls = [], isLoading } = useControls();

  const byLifecycle = useMemo(() => {
    const groups: Record<string, Control[]> = {};
    for (const trigger of LIFECYCLE_TRIGGERS) {
      groups[trigger] = controls.filter((c) => c.lifecycleTrigger.includes(trigger));
    }
    return groups;
  }, [controls]);

  if (isLoading) {
    return <div className="animate-pulse text-muted-foreground text-center py-16">Loading roadmap…</div>;
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-1">Implementation Roadmap</h2>
        <p className="text-sm text-muted-foreground">
          Controls organized by lifecycle trigger. IG1 (Critical Foundation) safeguards should be completed before broad rollout.
        </p>
      </div>

      {LIFECYCLE_TRIGGERS.map((trigger, i) => {
        const items = byLifecycle[trigger] || [];
        if (items.length === 0) return null;

        const igGroups = IG_LEVELS.map((ig) => ({
          ig,
          meta: IG_META[ig],
          items: items.filter((c) => c.implementationGuard === ig),
        }));

        return (
          <div key={trigger} className={`animate-fade-up stagger-${Math.min(i, 4)}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {items.length}
              </div>
              <h3 className="text-base font-semibold">{trigger}</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
              {igGroups.map(({ ig, meta, items: igItems }) => (
                <IGColumn key={ig} title={`${ig} — ${meta.name}`} items={igItems} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IGColumn({ title, items }: { title: string; items: Control[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-muted/50 rounded-lg p-3 border border-border border-dashed">
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">{title}</h4>
        <p className="text-xs text-muted-foreground italic">No controls in this phase</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-3 border border-border">
      <h4 className="text-xs font-semibold text-muted-foreground mb-2">{title}</h4>
      <div className="space-y-1.5">
        {items.map((c) => (
          <div key={c.controlId} className="flex items-start gap-2 text-sm">
            <ContentAreaDot prefix={getContentAreaPrefix(c)} />
            <div className="min-w-0">
              <span className="font-mono text-[10px] text-muted-foreground">{c.controlId}</span>
              <span className="mx-1 text-muted-foreground">·</span>
              <span className="text-xs">{c.safeguardTitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
