import { type Control, CONTENT_AREAS, IG_LEVELS, IG_META } from "@/lib/csv-loader";

interface IGBadgeProps {
  ig: string;
  size?: "sm" | "md";
}

export function IGBadge({ ig, size = "sm" }: IGBadgeProps) {
  const meta = IG_META[ig];
  const colorMap: Record<string, string> = {
    IG1: "ig1-badge", IG2: "ig2-badge", IG3: "ig3-badge",
    IG4: "ig4-badge", IG5: "ig5-badge",
  };
  const cls = colorMap[ig] || "ig1-badge";
  const label = meta?.name || ig;
  return (
    <span className={`${cls} ${size === "md" ? "text-sm px-3 py-1" : ""}`}>
      {ig} — {label}
    </span>
  );
}

export function ContentAreaDot({ prefix }: { prefix: string }) {
  const ca = CONTENT_AREAS.find((c) => c.id === prefix);
  if (!ca) return null;
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ background: `hsl(${ca.color})` }}
    />
  );
}

/** @deprecated Use ContentAreaDot instead */
export function PillarDot({ pillarId }: { pillarId: string }) {
  return <ContentAreaDot prefix={pillarId} />;
}

export function PillarBadge({ ig }: { ig: string }) {
  const meta = IG_META[ig];
  if (!meta) return null;
  const colors: Record<string, string> = {
    IG1: "bg-destructive/15 text-destructive",
    IG2: "bg-amber-100 text-amber-700",
    IG3: "bg-sky-100 text-sky-700",
    IG4: "bg-emerald-100 text-emerald-700",
    IG5: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${colors[ig] || "bg-muted text-muted-foreground"}`}>
      {meta.name}
    </span>
  );
}

export function CriticalityBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Critical: "bg-destructive/15 text-destructive",
    High: "bg-amber-100 text-amber-700",
    "Medium-High": "bg-sky-100 text-sky-700",
    Medium: "bg-emerald-100 text-emerald-700",
    "Advanced / Specialized": "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${colors[level] || "bg-muted text-muted-foreground"}`}>
      {level}
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
