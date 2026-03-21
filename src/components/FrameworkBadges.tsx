import { type Control, PILLARS } from "@/lib/csv-loader";

interface IGBadgeProps {
  ig: string;
  size?: "sm" | "md";
}

export function IGBadge({ ig, size = "sm" }: IGBadgeProps) {
  const cls = ig === "IG1" ? "ig1-badge" : ig === "IG2" ? "ig2-badge" : "ig3-badge";
  const label = ig === "IG1" ? "Essential" : ig === "IG2" ? "Managed" : "Advanced";
  return (
    <span className={`${cls} ${size === "md" ? "text-sm px-3 py-1" : ""}`}>
      {ig} — {label}
    </span>
  );
}

export function PillarDot({ pillarId }: { pillarId: string }) {
  const pillar = PILLARS.find((p) => p.id === pillarId);
  if (!pillar) return null;
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ background: `hsl(${pillar.color})` }}
    />
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    Critical: "bg-red-100 text-red-700",
    High: "bg-amber-100 text-amber-700",
    Medium: "bg-sky-100 text-sky-700",
    Low: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[priority] || "bg-muted text-muted-foreground"}`}>
      {priority}
    </span>
  );
}

export function StatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options = [
    { value: "not-started", label: "Not Started", color: "bg-muted" },
    { value: "in-progress", label: "In Progress", color: "bg-amber-400" },
    { value: "complete", label: "Complete", color: "bg-emerald-500" },
    { value: "not-applicable", label: "N/A", color: "bg-slate-300" },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs font-medium border border-border rounded-md px-2 py-1 bg-card focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
