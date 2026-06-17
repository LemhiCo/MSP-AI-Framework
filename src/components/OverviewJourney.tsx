import { useState, useMemo } from "react";
import { ChevronRight, Compass, Rocket, Sparkles, Workflow, Infinity as InfinityIcon, ArrowRight } from "lucide-react";
import type { Control } from "@/lib/csv-loader";

type Stage = {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  outcomes: string[];
  /** Hue (degrees) on the parchment palette */
  hue: number;
  icon: React.ComponentType<{ className?: string }>;
  /** Which IG levels from the framework roughly map here (for the sample-controls peek) */
  igMatch: string[];
  roles: {
    title: string;
    focus: string;
    moves: string[];
  }[];
};

const STAGES: Stage[] = [
  {
    id: "discovery",
    number: "01",
    title: "Discovery & Sales",
    tagline: "Earn the right to recommend AI.",
    description:
      "Before pitching anything AI, you map the customer's risk, readiness, and appetite. The conversation is about their business — not your tooling.",
    outcomes: [
      "Shared view of where AI fits the customer's strategy",
      "Honest baseline of governance, data, and skills readiness",
      "Right-sized starting point everyone signed off on",
    ],
    hue: 200,
    icon: Compass,
    igMatch: ["IG1"],
    roles: [
      {
        title: "MSP / Advisor",
        focus: "Diagnose, not demo",
        moves: ["Run readiness assessment", "Translate risk into business language", "Co-build the roadmap"],
      },
      {
        title: "Internal Champion",
        focus: "Make the case internally",
        moves: ["Align leadership on outcomes", "Surface real workflows worth changing", "Own the budget conversation"],
      },
      {
        title: "End Customer / User",
        focus: "Voice the daily pain",
        moves: ["Share where time is lost", "Flag tools that already failed", "Sanity-check the promise"],
      },
    ],
  },
  {
    id: "onboard",
    number: "02",
    title: "Onboard",
    tagline: "Set the foundation right the first time.",
    description:
      "Identity, data, policy, and skills get cleaned up before any model touches production data. This is the unglamorous work that decides whether AI succeeds.",
    outcomes: [
      "Tenancy, identity, and access hardened",
      "Data classified and sensitive content protected",
      "Acceptable-use policy signed and trained on",
    ],
    hue: 90,
    icon: Rocket,
    igMatch: ["IG1", "IG2"],
    roles: [
      {
        title: "MSP / Advisor",
        focus: "Stand up the guardrails",
        moves: ["Configure tenant baseline", "Roll out DLP & sensitivity labels", "Document the runbook"],
      },
      {
        title: "Internal Champion",
        focus: "Drive adoption of the basics",
        moves: ["Champion the AUP rollout", "Coordinate training cohorts", "Hold leaders accountable"],
      },
      {
        title: "End Customer / User",
        focus: "Learn the new rules",
        moves: ["Complete AI literacy training", "Use approved tools only", "Report what's broken"],
      },
    ],
  },
  {
    id: "generative",
    number: "03",
    title: "Generative AI",
    tagline: "Make Copilot earn its seat.",
    description:
      "Copilot, ChatGPT Enterprise, and friends go live with measured prompts, monitored outputs, and a clear list of jobs they're allowed to do.",
    outcomes: [
      "Approved generative tools deployed to the right roles",
      "Prompt library, guardrails, and reviews in place",
      "First wave of measurable time savings captured",
    ],
    hue: 25,
    icon: Sparkles,
    igMatch: ["IG3"],
    roles: [
      {
        title: "MSP / Advisor",
        focus: "Operate it like infrastructure",
        moves: ["Tune licensing & access", "Stand up output review", "Report adoption & ROI monthly"],
      },
      {
        title: "Internal Champion",
        focus: "Embed it in the work",
        moves: ["Curate prompts for the team", "Run office hours", "Celebrate wins publicly"],
      },
      {
        title: "End Customer / User",
        focus: "Build the habit",
        moves: ["Use Copilot in real workflows", "Flag bad outputs", "Share what saves time"],
      },
    ],
  },
  {
    id: "agentic",
    number: "04",
    title: "Agentic AI",
    tagline: "Trust agents to do bounded work.",
    description:
      "Custom agents take over discrete, well-defined jobs — with logging, evals, and a human still in the loop on anything that touches the customer.",
    outcomes: [
      "Custom agents shipped for specific workflows",
      "Evals, audit logs, and human-in-the-loop checks live",
      "Tier-1 work measurably handled by agents",
    ],
    hue: 280,
    icon: Workflow,
    igMatch: ["IG4"],
    roles: [
      {
        title: "MSP / Advisor",
        focus: "Engineer the agents",
        moves: ["Design the agent + tools", "Run evals before release", "Monitor drift continuously"],
      },
      {
        title: "Internal Champion",
        focus: "Redesign the process",
        moves: ["Choose what agents own", "Define escalation rules", "Sign off on accuracy bar"],
      },
      {
        title: "End Customer / User",
        focus: "Supervise the work",
        moves: ["Review agent output", "Approve customer-facing actions", "Coach the agent over time"],
      },
    ],
  },
  {
    id: "autopilot",
    number: "05",
    title: "Autopilot AI",
    tagline: "Operate the business with AI on shift.",
    description:
      "Multi-agent systems run continuously across functions. Humans set strategy and exception rules; agents handle the steady-state work.",
    outcomes: [
      "Multi-agent orchestration across functions",
      "Continuous evals, governance, and incident response",
      "Compounding leverage — work scales without headcount",
    ],
    hue: 340,
    icon: InfinityIcon,
    igMatch: ["IG5"],
    roles: [
      {
        title: "MSP / Advisor",
        focus: "Run the AI operations center",
        moves: ["Orchestrate multi-agent systems", "Lead incident response", "Continuously raise the bar"],
      },
      {
        title: "Internal Champion",
        focus: "Steward the strategy",
        moves: ["Set policy & exception rules", "Own the ROI story to the board", "Reinvest the leverage"],
      },
      {
        title: "End Customer / User",
        focus: "Work on what matters",
        moves: ["Focus on judgment work", "Coach agents on edge cases", "Escalate ethical concerns"],
      },
    ],
  },
];

export default function OverviewJourney({ controls }: { controls: Control[] }) {
  const [activeId, setActiveId] = useState<string>(STAGES[0].id);
  const active = STAGES.find((s) => s.id === activeId) ?? STAGES[0];

  const sampleControls = useMemo(() => {
    return controls
      .filter((c) => active.igMatch.includes(c.implementationGuard))
      .slice(0, 6);
  }, [controls, active]);

  return (
    <div className="w-full px-4 md:px-8 py-6 md:py-10 max-w-[1400px] mx-auto">
      {/* Intro */}
      <div className="mb-6 md:mb-10 max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">The Path</p>
        <h2 className="font-serif text-2xl md:text-4xl font-semibold mt-2 leading-tight">
          Take customers from <span className="italic">first conversation</span> to <span className="italic">AI on shift</span>.
        </h2>
        <p className="text-sm md:text-base text-muted-foreground mt-3 leading-relaxed">
          Five stages, in order. Each one earns the right to the next. Click a stage to see how the work splits across roles.
        </p>
      </div>

      {/* Horizontal stage path */}
      <div className="relative">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-[34px] left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-2 relative">
          {STAGES.map((s, i) => {
            const isActive = s.id === activeId;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className="group relative flex flex-col items-center text-center px-2 pt-1 pb-3 transition-all"
              >
                {/* Node */}
                <div
                  className={`relative w-[68px] h-[68px] rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive ? "scale-110 shadow-lg" : "group-hover:scale-105"
                  }`}
                  style={{
                    background: isActive
                      ? `hsl(${s.hue} 55% 45%)`
                      : `hsl(${s.hue} 30% 92%)`,
                    border: `2px solid hsl(${s.hue} ${isActive ? "55%" : "40%"} ${isActive ? "45%" : "70%"})`,
                    color: isActive ? "white" : `hsl(${s.hue} 50% 30%)`,
                  }}
                >
                  <Icon className="w-7 h-7" strokeWidth={1.6} />
                  <span className="absolute -top-1 -right-1 text-[9px] font-mono font-bold bg-card border border-border rounded-full w-6 h-6 flex items-center justify-center text-muted-foreground">
                    {s.number}
                  </span>
                </div>

                <h3
                  className={`mt-3 font-serif text-sm md:text-base leading-tight transition-colors ${
                    isActive ? "font-semibold" : "text-foreground/80 group-hover:text-foreground"
                  }`}
                  style={isActive ? { color: `hsl(${s.hue} 55% 30%)` } : undefined}
                >
                  {s.title}
                </h3>
                <p className="text-[10px] md:text-[11px] text-muted-foreground mt-1 leading-snug max-w-[160px]">
                  {s.tagline}
                </p>

                {/* Active underline */}
                {isActive && (
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full animate-fade-up"
                    style={{ background: `hsl(${s.hue} 55% 45%)`, animationDuration: "300ms" }}
                  />
                )}

                {/* Arrow between nodes (desktop) */}
                {i < STAGES.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-[28px] -right-3 w-4 h-4 text-border" strokeWidth={2} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active stage detail */}
      <div
        key={active.id}
        className="mt-8 md:mt-10 rounded-2xl border bg-card shadow-sm overflow-hidden animate-fade-up"
        style={{
          borderColor: `hsl(${active.hue} 40% 80%)`,
          animationDuration: "350ms",
        }}
      >
        {/* Header band */}
        <div
          className="px-5 md:px-8 py-5 md:py-6 border-b"
          style={{
            background: `linear-gradient(135deg, hsl(${active.hue} 40% 96%), hsl(${active.hue} 30% 92%))`,
            borderColor: `hsl(${active.hue} 40% 85%)`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `hsl(${active.hue} 55% 45%)`, color: "white" }}
            >
              <active.icon className="w-7 h-7" strokeWidth={1.6} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <span>Stage {active.number}</span>
                <span>·</span>
                <span>{active.tagline}</span>
              </div>
              <h3
                className="font-serif text-2xl md:text-3xl font-semibold mt-1 leading-tight"
                style={{ color: `hsl(${active.hue} 55% 25%)` }}
              >
                {active.title}
              </h3>
              <p className="text-sm md:text-base text-foreground/80 mt-2 leading-relaxed max-w-3xl">
                {active.description}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid lg:grid-cols-[1fr_320px]">
          {/* Roles + outcomes */}
          <div className="p-5 md:p-8 space-y-6">
            {/* Outcomes */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-3">
                What good looks like
              </p>
              <ul className="space-y-1.5">
                {active.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-sm leading-relaxed">
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: `hsl(${active.hue} 55% 45%)` }}
                    />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Role lanes */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-3">
                How it splits across roles
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                {active.roles.map((r) => (
                  <div
                    key={r.title}
                    className="rounded-xl border border-border bg-background/60 p-4 flex flex-col"
                  >
                    <h4 className="font-serif text-sm font-semibold leading-tight">{r.title}</h4>
                    <p
                      className="text-[11px] mt-0.5 font-medium"
                      style={{ color: `hsl(${active.hue} 55% 35%)` }}
                    >
                      {r.focus}
                    </p>
                    <ul className="mt-3 space-y-1.5 flex-1">
                      {r.moves.map((m) => (
                        <li key={m} className="flex items-start gap-1.5 text-[12px] text-foreground/85 leading-snug">
                          <ChevronRight
                            className="w-3 h-3 mt-0.5 flex-shrink-0"
                            style={{ color: `hsl(${active.hue} 55% 50%)` }}
                          />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sample controls */}
          <aside
            className="border-t lg:border-t-0 lg:border-l p-5 md:p-6 bg-background/40"
            style={{ borderColor: `hsl(${active.hue} 40% 85%)` }}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-3">
              Sample controls at this stage
            </p>
            {sampleControls.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Switch to the detailed view to explore controls.</p>
            ) : (
              <ul className="space-y-2">
                {sampleControls.map((c) => (
                  <li key={c.controlId} className="text-[12px] leading-snug">
                    <span className="font-mono text-[10px] text-muted-foreground">{c.controlId}</span>
                    <span className="block text-foreground/85">{c.safeguardTitle}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[10px] text-muted-foreground mt-4 italic">
              Want the full grid? Switch to <span className="font-semibold">Detailed</span> view above.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}