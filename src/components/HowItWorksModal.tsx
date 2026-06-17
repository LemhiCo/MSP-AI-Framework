import { X, Shield, Lock, Activity, Compass, LayoutGrid, ArrowRight } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onWalkPath: () => void;
  onViewMatrix: () => void;
}

const GSO = [
  {
    letter: "G",
    title: "Govern",
    icon: Shield,
    text: "Set ownership, intent, and boundaries before AI spreads. Who decides, what's in scope, how changes get approved.",
  },
  {
    letter: "S",
    title: "Secure",
    icon: Lock,
    text: "Make AI respect identity, data, and environment boundaries. Intentional containment, not lockdown.",
  },
  {
    letter: "O",
    title: "Operate",
    icon: Activity,
    text: "Run AI like a production service — staged rollout, observability, support, rollback. If you can't operate it, don't enable it.",
  },
];

export default function HowItWorksModal({ open, onClose, onWalkPath, onViewMatrix }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col animate-fade-up relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animationDuration: "350ms" }}
      >
        {/* Header */}
        <div className="px-6 md:px-8 pt-6 pb-5 border-b border-border bg-gradient-to-br from-card via-card to-secondary/30 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
            Welcome to the MAGIC Framework
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold mt-2 leading-tight">
            How MSPs <span className="italic">Govern, Secure & Operate</span> AI at scale.
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl">
            MAGIC is a controls-first framework — not a tool list, not a theory. If CIS Controls made cybersecurity
            operational for MSPs, MAGIC does the same for AI.
          </p>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 md:px-8 py-6 space-y-7 flex-1">
          {/* GSO Loop */}
          <section>
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-3">
              The Core Loop · GSO
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {GSO.map((g) => {
                const Icon = g.icon;
                return (
                  <div
                    key={g.letter}
                    className="rounded-xl border border-border bg-background/60 p-4 flex flex-col"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] text-muted-foreground">{g.letter}</span>
                        <h3 className="font-serif text-base font-semibold leading-none">{g.title}</h3>
                      </div>
                    </div>
                    <p className="text-[12px] text-foreground/80 leading-relaxed mt-3">{g.text}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* How it's structured */}
          <section>
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-3">
              How it's structured
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h4 className="font-serif font-semibold text-sm">5 Implementation Guards</h4>
                <p className="text-[12px] text-foreground/80 mt-1.5 leading-relaxed">
                  Controls sequence from <span className="font-semibold">Baseline</span> through{" "}
                  <span className="font-semibold">Frontier</span>. Each level earns the right to the next — no skipping ahead.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h4 className="font-serif font-semibold text-sm">10 Content Areas</h4>
                <p className="text-[12px] text-foreground/80 mt-1.5 leading-relaxed">
                  Strategy, Governance, Technical Readiness, Copilot, Process, Data, Observability,
                  Deployment, People & Skills, and Security.
                </p>
              </div>
            </div>
          </section>

          {/* Two paths CTA */}
          <section>
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-3">
              Two ways in
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <button
                onClick={onWalkPath}
                className="group text-left rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 p-5 transition-all hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-5 h-5 text-primary" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
                    Recommended
                  </span>
                </div>
                <h4 className="font-serif text-lg font-semibold leading-tight">Walk the path</h4>
                <p className="text-[12px] text-foreground/75 mt-1.5 leading-relaxed">
                  A guided 5-stage journey from first conversation to AI on shift. See how the work
                  splits across roles at each stage.
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-primary text-xs font-semibold">
                  Start the journey <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                onClick={onViewMatrix}
                className="group text-left rounded-xl border border-border bg-background hover:bg-muted/40 hover:border-accent/60 p-5 transition-all hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <LayoutGrid className="w-5 h-5 text-accent" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                    Power user
                  </span>
                </div>
                <h4 className="font-serif text-lg font-semibold leading-tight">Show me the matrix</h4>
                <p className="text-[12px] text-foreground/75 mt-1.5 leading-relaxed">
                  Skip the tour. Drop straight into the full controls grid — 5 IGs × 10 Content Areas,
                  every safeguard browsable.
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-accent text-xs font-semibold">
                  Open the MAGIC matrix <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}