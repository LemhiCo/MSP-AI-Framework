import { useMemo } from "react";
import { useControls } from "@/hooks/use-framework-data";
import { PillarDot, IGBadge } from "@/components/FrameworkBadges";
import { PILLARS } from "@/lib/csv-loader";

export default function DashboardOverview() {
  const { data: controls = [], isLoading } = useControls();

  const stats = useMemo(() => {
    const ig1 = controls.filter((c) => c.ig === "IG1").length;
    const ig2 = controls.filter((c) => c.ig === "IG2").length;
    const ig3 = controls.filter((c) => c.ig === "IG3").length;
    return { total: controls.length, ig1, ig2, ig3 };
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
          Seven pillars, three implementation groups, {stats.total} safeguards.
        </p>
      </div>

      {/* IG Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <IGCard ig="IG1" label="Essential" count={stats.ig1} description="Minimum safe floor before broad AI rollout" />
        <IGCard ig="IG2" label="Managed" count={stats.ig2} description="Repeatable, reviewable, supportable practice" />
        <IGCard ig="IG3" label="Advanced" count={stats.ig3} description="Restrictions, analytics, and lifecycle maturity" />
      </div>

      {/* Pillar Breakdown */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <h2 className="text-sm font-semibold mb-3">Controls by Pillar</h2>
        <div className="space-y-2">
          {PILLARS.map((pillar) => {
            const pillarControls = controls.filter((c) => c.pillar === pillar.name);
            const ig1 = pillarControls.filter((c) => c.ig === "IG1").length;
            const ig2 = pillarControls.filter((c) => c.ig === "IG2").length;
            const ig3 = pillarControls.filter((c) => c.ig === "IG3").length;
            return (
              <div key={pillar.id} className="flex items-center gap-3">
                <PillarDot pillarId={pillar.id} />
                <span className="text-sm font-medium w-48 truncate">{pillar.name}</span>
                <div className="flex-1 flex gap-0.5 h-5 rounded overflow-hidden bg-muted">
                  {ig1 > 0 && (
                    <div
                      className="flex items-center justify-center text-[10px] font-bold"
                      style={{
                        width: `${(ig1 / pillarControls.length) * 100}%`,
                        background: "hsl(var(--ig1))",
                        color: "white",
                      }}
                    >
                      {ig1}
                    </div>
                  )}
                  {ig2 > 0 && (
                    <div
                      className="flex items-center justify-center text-[10px] font-bold"
                      style={{
                        width: `${(ig2 / pillarControls.length) * 100}%`,
                        background: "hsl(var(--ig2))",
                        color: "white",
                      }}
                    >
                      {ig2}
                    </div>
                  )}
                  {ig3 > 0 && (
                    <div
                      className="flex items-center justify-center text-[10px] font-bold"
                      style={{
                        width: `${(ig3 / pillarControls.length) * 100}%`,
                        background: "hsl(var(--ig3))",
                        color: "white",
                      }}
                    >
                      {ig3}
                    </div>
                  )}
                </div>
                <span className="text-xs font-mono tabular-nums text-muted-foreground w-6 text-right">{pillarControls.length}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--ig1))" }} /> IG1</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--ig2))" }} /> IG2</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--ig3))" }} /> IG3</span>
        </div>
      </div>

      {/* Key Principles */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <h2 className="text-sm font-semibold mb-3">Framework Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Principle title="Design Focus" text="Every safeguard is written from the perspective of a single customer environment." />
          <Principle title="Rollout Principle" text="No broad deployment until IG1 safeguards are complete across all seven pillars." />
          <Principle title="Lifecycle Columns" text="Each safeguard maps to Onboarding, QBR, Employee events, Project, or Security Incident motions." />
          <Principle title="Tooling Columns" text="Both Microsoft-native and generic tooling categories so the framework stays platform-aware." />
        </div>
      </div>
    </div>
  );
}

function IGCard({ ig, label, count, description }: { ig: string; label: string; count: number; description: string }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <IGBadge ig={ig} size="md" />
        <span className="text-2xl font-bold tabular-nums">{count}</span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
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
