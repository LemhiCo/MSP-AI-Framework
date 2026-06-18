import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronRight, Compass, Rocket, Sparkles, Workflow, Infinity as InfinityIcon, type LucideIcon } from "lucide-react";
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
  icon: LucideIcon;
  /** Which IG levels from the framework roughly map here (for the sample-controls peek) */
  igMatch: string[];
  /** Example tools customers will recognize at this level */
  tools?: string[];
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
    title: "Discovery",
    tagline: "Earn the right to recommend AI.",
    description:
      "Before pitching anything AI, find out where the team actually stands. A quick per-employee readiness pulse turns guesswork into Comfort, Usage and Quality scores, surfaces shadow AI already in the building, and ranks the use cases employees most want help with — so the conversation is about their business, not your tooling.",
    outcomes: [
      "Org-level Comfort, Usage & Quality readiness scores",
      "Shadow-AI footprint named, not guessed at",
      "Top-ranked use cases with hours-saved estimates",
    ],
    hue: 200,
    icon: Compass,
    igMatch: ["IG1"],
    tools: ["Readiness survey", "Workshop deck", "M365 / Google Workspace signals"],
    roles: [
      {
        title: "MSP / Advisor",
        focus: "Hold the facts, not the demo",
        moves: [
          "Send a readiness survey to every desk worker",
          "Present the findings to leadership in their own words",
          "Frame shadow AI as a risk + revenue conversation",
        ],
      },
      {
        title: "Internal Champion",
        focus: "Make the case internally",
        moves: ["Rally the team to complete the survey", "Align leadership on the readiness story", "Own the budget conversation"],
      },
      {
        title: "End Customer / User",
        focus: "Voice the daily pain",
        moves: ["Answer the readiness pulse honestly", "Rank the use cases that matter most", "Name the tools already in use"],
      },
    ],
  },
  {
    id: "onboard",
    number: "02",
    title: "Onboard",
    tagline: "Turn the plan into a funded program.",
    description:
      "Convert the readiness signal into a costed, phased, governed 90-day plan: Quick Wins, Expanding Impact, Scaling. In parallel, identity, data, policy and AI literacy get hardened so nothing ships into a leaky tenant.",
    outcomes: [
      "Signed 90-day plan with break-even month",
      "Tenancy, identity & data classification hardened",
      "Acceptable-use policy live and trained on",
    ],
    hue: 90,
    icon: Rocket,
    igMatch: ["IG2"],
    tools: ["90-day plan", "Executive summary", "Tenant baseline + DLP", "AI literacy curriculum"],
    roles: [
      {
        title: "MSP / Advisor",
        focus: "Stand up the guardrails",
        moves: ["Build the 90-day plan with the client", "Configure tenant + DLP + labels", "Name owners and the training model"],
      },
      {
        title: "Internal Champion",
        focus: "Drive adoption of the basics",
        moves: ["Sign off as exec sponsor", "Coordinate training cohorts", "Hold leaders accountable to the 90-day plan"],
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
    tagline: "Make GenAI earn its seat.",
    description:
      "Reactive, human-directed tools — ChatGPT, Microsoft 365 GenAI, Google Gemini, Claude, DALL·E — go live with measured prompts, monitored outputs, and a clear list of jobs they're allowed to do. Ship the Quick Wins first so the team feels payoff in the first 30 days.",
    outcomes: [
      "Approved GenAI tools deployed to the right roles",
      "Prompt library, guardrails and output reviews live",
      "First wave of measurable hours-back captured",
    ],
    hue: 25,
    icon: Sparkles,
    igMatch: ["IG3"],
    tools: ["ChatGPT", "Microsoft 365 GenAI", "Google Gemini", "Claude", "DALL·E"],
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
        moves: ["Use GenAI in real workflows", "Flag bad outputs", "Share what saves time"],
      },
    ],
  },
  {
    id: "agentic",
    number: "04",
    title: "Agentic AI",
    tagline: "Trust agents to do bounded work.",
    description:
      "Multi-step agents plan and execute toward a goal using tools — Microsoft Copilot Studio agents, Claude Cowork, ChatGPT Custom Agents. They take over discrete, well-defined jobs with logging, evals and a human in the loop on anything customer-facing. This is where the rollout expands beyond individual productivity into real workflows.",
    outcomes: [
      "Custom agents shipped for specific workflows",
      "Evals, audit logs, and human-in-the-loop checks live",
      "Tier-1 work measurably handled by agents",
    ],
    hue: 280,
    icon: Workflow,
    igMatch: ["IG4"],
    tools: ["Microsoft Copilot Studio agents", "Claude Cowork", "ChatGPT Custom Agents"],
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
      "Fully autonomous systems — Hermes, Microsoft Scout, OpenClaw — run entire processes end-to-end and self-correct. People set the guardrails; the system runs the function. Ongoing measurement proves it's working and grows the engagement at every QBR.",
    outcomes: [
      "Multi-agent orchestration across functions",
      "Continuous evals, governance, and incident response",
      "Compounding leverage — work scales without headcount",
    ],
    hue: 340,
    icon: InfinityIcon,
    igMatch: ["IG5"],
    tools: ["Hermes", "Microsoft Scout", "OpenClaw"],
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

// Maps a journey stage to its position on the Levels of AI pyramid (L1/L2/L3).
// Discovery & Onboard sit at the foundation (no tier highlighted).
const STAGE_TO_LEVEL: Record<string, 0 | 1 | 2 | 3> = {
  discovery: 0,
  onboard: 0,
  generative: 1,
  agentic: 2,
  autopilot: 3,
};

function LevelsOfAIChip({ stageId, hue }: { stageId: string; hue: number }) {
  const level = STAGE_TO_LEVEL[stageId] ?? 0;
  const tiers = [
    { id: 1, label: "L1", name: "Generative" },
    { id: 2, label: "L2", name: "Agentic" },
    { id: 3, label: "L3", name: "Autopilot" },
  ];
  const activeName = tiers.find((t) => t.id === level)?.name;
  return (
    <div className="inline-flex items-center gap-1.5 flex-shrink-0">
      <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground hidden sm:inline">
        AI level
      </span>
      <div className="inline-flex rounded-full border bg-background/70 p-0.5" style={{ borderColor: `hsl(${hue} 40% 80%)` }}>
        {tiers.map((t) => {
          const isActive = t.id === level;
          return (
            <span
              key={t.id}
              className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full transition-colors"
              style={{
                background: isActive ? `hsl(${hue} 55% 40%)` : "transparent",
                color: isActive ? "white" : `hsl(${hue} 30% 45%)`,
                opacity: level === 0 ? 0.5 : isActive ? 1 : 0.5,
              }}
            >
              {t.label}
            </span>
          );
        })}
      </div>
      {activeName && (
        <span
          className="text-[10px] font-mono uppercase tracking-wider hidden md:inline"
          style={{ color: `hsl(${hue} 50% 32%)` }}
        >
          {activeName}
        </span>
      )}
    </div>
  );
}

export default function OverviewJourney({ controls }: { controls: Control[] }) {
  const [activeId, setActiveId] = useState<string>(STAGES[0].id);
  const active = STAGES.find((s) => s.id === activeId) ?? STAGES[0];
  const railRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const rail = railRef.current;
    const node = nodeRefs.current[activeId];
    if (!rail || !node) return;
    // Only auto-center on mobile (rail is horizontally scrollable)
    if (rail.scrollWidth <= rail.clientWidth) return;
    const target = node.offsetLeft - rail.clientWidth / 2 + node.offsetWidth / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [activeId]);

  const sampleControls = useMemo(() => {
    return controls
      .filter((c) => active.igMatch.includes(c.implementationGuard))
      .slice(0, 6);
  }, [controls, active]);

  return (
    <div className="w-full px-3 md:px-8 py-4 md:py-8 max-w-[1400px] mx-auto">
      {/* Intro */}
      <div className="mb-4 md:mb-6 max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">The Path</p>
        <h2 className="font-serif text-xl md:text-3xl font-semibold mt-1.5 leading-tight">
          From <span className="italic">first conversation</span> to <span className="italic">AI on shift</span>.
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-2 leading-relaxed">
          Five stages, in order. Tap one to see how it splits across roles.
        </p>
      </div>

      {/* Stage rail — horizontal scroll on mobile, grid on desktop */}
      <div className="relative -mx-3 md:mx-0">
        <div className="md:hidden absolute top-[22px] left-0 right-0 h-px bg-border/60" />
        <div className="hidden md:block absolute top-[22px] left-[6%] right-[6%] h-px bg-border/60" />
        <div ref={railRef} className="flex md:grid md:grid-cols-5 gap-1 md:gap-2 overflow-x-auto md:overflow-visible snap-x snap-mandatory px-3 md:px-0 pb-2 scrollbar-tan scroll-smooth">
          {STAGES.map((s) => {
            const isActive = s.id === activeId;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                ref={(el) => { nodeRefs.current[s.id] = el; }}
                onClick={() => setActiveId(s.id)}
                className="group relative flex flex-col items-center text-center pt-1 pb-2 snap-center flex-shrink-0 w-[110px] md:w-auto transition-all"
              >
                <div
                  className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive ? "shadow-md" : "group-hover:scale-105"
                  }`}
                  style={{
                    background: isActive ? `hsl(${s.hue} 55% 45%)` : `hsl(${s.hue} 30% 94%)`,
                    border: `1.5px solid hsl(${s.hue} ${isActive ? "55%" : "35%"} ${isActive ? "45%" : "75%"})`,
                    color: isActive ? "white" : `hsl(${s.hue} 50% 32%)`,
                  }}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.7} />
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[9px] font-mono text-muted-foreground">{s.number}</span>
                  <h3
                    className={`font-serif text-[12px] md:text-[13px] leading-tight transition-colors ${
                      isActive ? "font-semibold" : "text-foreground/75 group-hover:text-foreground"
                    }`}
                    style={isActive ? { color: `hsl(${s.hue} 55% 28%)` } : undefined}
                  >
                    {s.title}
                  </h3>
                </div>
                {isActive && (
                  <div
                    className="mt-1 w-8 h-0.5 rounded-full"
                    style={{ background: `hsl(${s.hue} 55% 45%)` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active stage detail */}
      <div
        key={active.id}
        className="mt-4 md:mt-6 rounded-xl border bg-card shadow-sm overflow-hidden animate-fade-up"
        style={{
          borderColor: `hsl(${active.hue} 40% 80%)`,
          animationDuration: "350ms",
        }}
      >
        {/* Header band */}
        <div
          className="px-4 md:px-6 py-4 md:py-5 border-b"
          style={{
            background: `linear-gradient(135deg, hsl(${active.hue} 40% 96%), hsl(${active.hue} 30% 92%))`,
            borderColor: `hsl(${active.hue} 40% 85%)`,
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground min-w-0">
              <span>Stage {active.number}</span>
              <span>·</span>
              <span className="truncate">{active.tagline}</span>
            </div>
            <LevelsOfAIChip stageId={active.id} hue={active.hue} />
          </div>
          <h3
            className="font-serif text-xl md:text-2xl font-semibold leading-tight"
            style={{ color: `hsl(${active.hue} 55% 25%)` }}
          >
            {active.title}
          </h3>
          <p className="text-[13px] md:text-sm text-foreground/80 mt-1.5 leading-relaxed max-w-3xl">
            {active.description}
          </p>
        </div>

        {/* Body */}
        <div className="grid xl:grid-cols-[1fr_260px]">
          {/* Roles + outcomes */}
          <div className="p-4 md:p-6 space-y-5">
            {/* Outcomes */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-2">
                What good looks like
              </p>
              <ul className="space-y-1">
                {active.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-[13px] leading-snug">
                    <span
                      className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: `hsl(${active.hue} 55% 45%)` }}
                    />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Example tools */}
            {active.tools && active.tools.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-2">
                  Example tools
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {active.tools.map((t) => (
                    <span
                      key={t}
                      className="text-[10.5px] px-2 py-0.5 rounded-full border bg-background/60"
                      style={{
                        borderColor: `hsl(${active.hue} 40% 80%)`,
                        color: `hsl(${active.hue} 50% 28%)`,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Role lanes */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-2">
                How it splits across roles
              </p>
              <div className="grid sm:grid-cols-3 gap-2">
                {active.roles.map((r) => (
                  <div
                    key={r.title}
                    className="rounded-lg border border-border bg-background/60 p-3 flex flex-col"
                  >
                    <h4 className="font-serif text-[13px] font-semibold leading-tight">{r.title}</h4>
                    <p
                      className="text-[10.5px] mt-0.5 font-medium"
                      style={{ color: `hsl(${active.hue} 55% 35%)` }}
                    >
                      {r.focus}
                    </p>
                    <ul className="mt-2 space-y-1 flex-1">
                      {r.moves.map((m) => (
                        <li key={m} className="flex items-start gap-1 text-[11.5px] text-foreground/85 leading-snug">
                          <ChevronRight
                            className="w-2.5 h-2.5 mt-0.5 flex-shrink-0"
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
            className="border-t xl:border-t-0 xl:border-l p-4 md:p-5 bg-background/40"
            style={{ borderColor: `hsl(${active.hue} 40% 85%)` }}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-2">
              Sample controls
            </p>
            {sampleControls.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Switch to the detailed view to explore controls.</p>
            ) : (
              <ul className="space-y-1.5">
                {sampleControls.map((c) => (
                  <li key={c.controlId} className="text-[11.5px] leading-snug">
                    <span className="font-mono text-[9.5px] text-muted-foreground">{c.controlId}</span>
                    <span className="block text-foreground/85">{c.safeguardTitle}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[10px] text-muted-foreground mt-3 italic">
              Full grid in <span className="font-semibold">Detailed</span> view.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}