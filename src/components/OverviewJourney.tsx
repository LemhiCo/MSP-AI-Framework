import { useState, useMemo } from "react";
import { ChevronRight, Compass, Rocket, Sparkles, Workflow, Infinity as InfinityIcon, ArrowRight, type LucideIcon } from "lucide-react";
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
    title: "Discovery & Sales",
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
    tools: ["ChatGPT", "Microsoft 365 GenAI", "Google Gemini", "Claude", "DALL·E", "Line-of-business AI (Hubspot, Salesforce Einstein, Intuit AI)"],
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
    tools: ["Microsoft Copilot Studio agents", "Claude Cowork", "ChatGPT Custom Agents", "Agent eval harness"],
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
    tools: ["Hermes", "Microsoft Scout", "OpenClaw", "Measurement dashboards"],
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

function LevelsOfAIPyramid({ stageId, hue }: { stageId: string; hue: number }) {
  const level = STAGE_TO_LEVEL[stageId] ?? 0;
  const tiers = [
    { id: 3, label: "L3", name: "Autopilot", y: 12, x1: 78, x2: 122 },
    { id: 2, label: "L2", name: "Agentic", y: 38, x1: 62, x2: 138 },
    { id: 1, label: "L1", name: "Generative", y: 64, x1: 46, x2: 154 },
  ];
  const activeFill = `hsl(${hue} 55% 38%)`;
  const inactiveFill = `hsl(${hue} 25% 82%)`;
  const inactiveStroke = `hsl(${hue} 30% 72%)`;

  return (
    <div className="hidden md:flex flex-col items-end flex-shrink-0 ml-2">
      <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
        Levels of AI
      </span>
      <svg width="148" height="92" viewBox="0 0 200 92" className="overflow-visible">
        {/* Increasing autonomy axis */}
        <g>
          <line x1="14" y1="84" x2="14" y2="14" stroke={inactiveStroke} strokeWidth="1" strokeDasharray="2 2" />
          <polygon points="14,8 11,14 17,14" fill={inactiveStroke} />
          <text
            x="6"
            y="50"
            transform="rotate(-90 6 50)"
            fontSize="6.5"
            fill="currentColor"
            className="text-muted-foreground"
            letterSpacing="1"
            fontFamily="ui-monospace, monospace"
          >
            AUTONOMY
          </text>
        </g>
        {tiers.map((t) => {
          const isActive = t.id === level;
          const isDim = level !== 0 && !isActive;
          return (
            <g key={t.id} opacity={isDim ? 0.55 : 1}>
              <polygon
                points={`${t.x1},${t.y + 22} ${t.x2},${t.y + 22} ${t.x2 - 8},${t.y} ${t.x1 + 8},${t.y}`}
                fill={isActive ? activeFill : inactiveFill}
                stroke={isActive ? activeFill : inactiveStroke}
                strokeWidth="1"
                style={{ transition: "all 350ms ease" }}
              />
              <text
                x={(t.x1 + t.x2) / 2}
                y={t.y + 14}
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill={isActive ? "white" : `hsl(${hue} 40% 32%)`}
                fontFamily="ui-monospace, monospace"
                letterSpacing="0.5"
              >
                {t.label}
              </text>
              {isActive && (
                <text
                  x={t.x2 + 8}
                  y={t.y + 15}
                  fontSize="8"
                  fontWeight="600"
                  fill={activeFill}
                  fontFamily="ui-monospace, monospace"
                  letterSpacing="0.5"
                >
                  {t.name.toUpperCase()}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

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
            <div className="min-w-0 flex-1">
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
            <LevelsOfAIPyramid stageId={active.id} hue={active.hue} />
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

            {/* Example tools */}
            {active.tools && active.tools.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-3">
                  Example tools at this level
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {active.tools.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2.5 py-1 rounded-full border bg-background/60"
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