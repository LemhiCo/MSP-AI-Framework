import { useMemo } from "react";
import { useControls } from "@/hooks/use-framework-data";
import { ContentAreaDot, IGBadge } from "@/components/FrameworkBadges";
import { CONTENT_AREAS, IG_LEVELS, IG_META, getContentAreaPrefix } from "@/lib/csv-loader";

export default function DashboardOverview() {
  const { data: controls = [], isLoading } = useControls();

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ig of IG_LEVELS) {
      counts[ig] = controls.filter((c) => c.implementationGuard === ig).length;
    }
    return { total: controls.length, counts };
  }, [controls]);

  if (isLoading) {
    return <div className="animate-pulse text-muted-foreground text-center py-16">Loading…</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <h1 className="text-xl font-bold mb-1" style={{ lineHeight: 1.1 }}>
          Managed AI Governance & Implementation Controls (MAGIC)
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          CIS-inspired control model for deploying AI safely inside each customer environment.
          Five implementation guards, nine content areas, {stats.total} safeguards.
        </p>
      </div>

      {/* IG Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {IG_LEVELS.map((ig) => {
          const meta = IG_META[ig];
          return (
            <div key={ig} className="bg-card rounded-lg border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">{ig}</span>
                <span className="text-2xl font-bold tabular-nums">{stats.counts[ig]}</span>
              </div>
              <p className="text-[10px] font-medium">{meta.name}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{meta.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Content Area Breakdown */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <h2 className="text-sm font-semibold mb-3">Controls by Content Area</h2>
        <div className="space-y-2">
          {CONTENT_AREAS.map((ca) => {
            const caControls = controls.filter((c) => getContentAreaPrefix(c) === ca.id);
            const igCounts: Record<string, number> = {};
            for (const ig of IG_LEVELS) {
              igCounts[ig] = caControls.filter((c) => c.implementationGuard === ig).length;
            }
            return (
              <div key={ca.id} className="flex items-center gap-3">
                <ContentAreaDot prefix={ca.id} />
                <span className="text-sm font-medium w-48 truncate">{ca.name}</span>
                <div className="flex-1 flex gap-0.5 h-5 rounded overflow-hidden bg-muted">
                  {IG_LEVELS.map((ig, i) => {
                    const count = igCounts[ig];
                    if (count === 0) return null;
                    const colors = ["hsl(0 70% 50%)", "hsl(25 80% 50%)", "hsl(200 50% 42%)", "hsl(168 40% 35%)", "hsl(280 40% 45%)"];
                    return (
                      <div key={ig} className="flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ width: `${(count / Math.max(caControls.length, 1)) * 100}%`, background: colors[i] }}>
                        {count}
                      </div>
                    );
                  })}
                </div>
                <span className="text-xs font-mono tabular-nums text-muted-foreground w-6 text-right">{caControls.length}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-[10px] text-muted-foreground flex-wrap">
          {IG_LEVELS.map((ig, i) => {
            const colors = ["0 70% 50%", "25 80% 50%", "200 50% 42%", "168 40% 35%", "280 40% 45%"];
            return (
              <span key={ig} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: `hsl(${colors[i]})` }} /> {ig}
              </span>
            );
          })}
        </div>
      </div>

      {/* Key Principles */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <h2 className="text-sm font-semibold mb-3">Framework Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Principle title="Design Focus" text="Every safeguard is written from the perspective of a single customer environment." />
          <Principle title="Rollout Principle" text="No broad deployment until IG1 (Critical Foundation) safeguards are complete." />
          <Principle title="5 Implementation Guards" text="Controls sequence from Critical Foundation through Agentic Enterprise Readiness." />
          <Principle title="9 Content Areas" text="Strategy, People & Skills, Governance, Technical, Copilot, Process, Data, Observability, and Deployment." />
        </div>
      </div>
    </div>
  );
}

function Principle({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-surface-sunken rounded-md p-3">
      <h3 className="text-xs font-semibold mb-0.5">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
